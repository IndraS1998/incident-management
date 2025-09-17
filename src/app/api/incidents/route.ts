import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import { Incident,Room,AdminDepartment,IncidentResolution,AIResolutionProposal } from '@/lib/models';
import {Types,startSession} from 'mongoose'

export async function GET(req:Request){
    const {searchParams}= new URL(req.url);
    const adminId = searchParams.get('adminId');
    const getCount = searchParams.get('count') === 'true'
    if (!adminId) {
      return NextResponse.json({ error: 'adminId is required' }, { status: 400 });
    }
    try{
        await connectDatabase();

        // Step 1: Get departments the admin is responsible for
        const adminDepartments = await AdminDepartment.find({ admin_id: new Types.ObjectId(adminId) }).lean();
        const departmentIds = adminDepartments.map(d => d.department_id);
        
        if (departmentIds.length === 0) {
            return NextResponse.json([]);
        }

        // Step 2: Get rooms in those departments
        const rooms = await Room.find({ department_id: { $in: departmentIds } }).lean();
        const roomIds = rooms.map(r => r._id);

        if (roomIds.length === 0) {
            return NextResponse.json([]);
        }

         if (getCount) {
            // Step 3a: Return only the count of pending incidents
            const count = await Incident.countDocuments({
                room_id: { $in: roomIds },
                status: 'pending'
            });
            return NextResponse.json({ count });
        } else {
            // Step 3b: Return all incidents (populating room & department info)
            const incidents = await Incident.find({ room_id: { $in: roomIds },status: 'pending' })
                .populate({
                    path: 'room_id',
                    select: 'room_number floor_number building_name department_id',
                    populate: {
                        path: 'department_id',
                        model: 'Department',
                        select: 'name contact'
                    }
                })
                .sort({ created_at: -1 }) // Newest first
                .lean();
            const formattedIncidents = incidents.map(incident => {
                const room = incident.room_id; // Type assertion for populated data
                return {
                    ...incident,
                    room_number: room?.room_number,
                    floor_number: room?.floor_number,
                    building_name: room?.building_name,
                    department: room?.department_id ? {
                        name: room.department_id.name,
                        contact: room.department_id.contact
                    } : null
                };
            });
            return NextResponse.json(formattedIncidents);
        }

    }catch(error){
        console.error('Error fetching floors:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch floors' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { _id } = await req.json();
        
        if (!_id) {
            return NextResponse.json({ error: 'Incident _id is required' }, { status: 400 });
        }

        await connectDatabase();

        // Validate if _id is a valid MongoDB ObjectId
        if (!Types.ObjectId.isValid(_id)) {
            return NextResponse.json({ error: 'Invalid incident ID format' }, { status: 400 });
        }

        // Update the incident status to IN_PROGRESS and set updated_at timestamp
        const updatedIncident = await Incident.findByIdAndUpdate(
            _id,
            { 
                status: 'in_progress',
                updated_at: new Date()
            },
            { new: true, runValidators: true } // Return updated document and validate
        );

        if (!updatedIncident) {
            return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Incident status updated to in progress',
            data: {
                incident_id: updatedIncident.incident_id,
                status: updatedIncident.status,
                updated_at: updatedIncident.updated_at
            }
        });

    } catch (error) {
        console.error('Error updating incident status:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to update incident status' 
        }, { status: 500 });
    }
}

export async function PUT(req: Request) {
  const session = await startSession();
  session.startTransaction();

  try {
    const body = await req.json();
    const { _id, proposal } = body;

    if (!_id || !proposal) {
      return NextResponse.json(
        { error: "Incident _id and proposal data are required" },
        { status: 400 }
      );
    }

    await connectDatabase();

    if (!Types.ObjectId.isValid(_id)) {
      return NextResponse.json(
        { error: "Invalid incident ID format" },
        { status: 400 }
      );
    }

    // 1. Save AIResolutionProposal
    const newProposal = await AIResolutionProposal.create(
      [
        {
          proposal_id: `PROP-${Date.now()}`,
          incident_id: _id,
          admin_id: proposal.admin_id,
          incident_type: proposal.incident_type,
          diagnosis: proposal.diagnosis,
          resolution_strategy_type: proposal.resolution_strategy_type,
          measure: proposal.measure,
          recommendation: proposal.recommendation,
        },
      ],
      { session }
    );

    // 2. Update Incident state
    const updatedIncident = await Incident.findByIdAndUpdate(
      _id,
      {
        status: "in_progress",
        updated_at: new Date(),
      },
      { new: true, runValidators: true, session }
    );

    if (!updatedIncident) {
      await session.abortTransaction();
      return NextResponse.json(
        { error: "Incident not found" },
        { status: 404 }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      success: true,
      message: "Incident updated to in progress with AI proposal",
      data: {
        incident_id: updatedIncident.incident_id,
        status: updatedIncident.status,
        updated_at: updatedIncident.updated_at,
        proposal_id: newProposal[0].proposal_id,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Error processing AI proposal:", error);
    return NextResponse.json(
      { success: false, message: "Failed to apply AI proposal" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const body = await req.json();
  const { incident_id, status, adminId, incident_type, resolution_strategy_type, diagnosis, measure, recommendation } = body;

  try {
    await connectDatabase();

    // 1. Update Incident status
    const incident = await Incident.findByIdAndUpdate(
      incident_id,
      { status, updated_at: new Date() },
      { new: true }
    );

    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    // 2. If resolved, create IncidentResolution
    if (status === "resolved") {
      const resolution = new IncidentResolution({
        resolution_id: `RES-${Date.now()}`, // Generate unique id
        incident_id: new Types.ObjectId(incident_id),
        admin_id: new Types.ObjectId(adminId),
        resolution_time: new Date(),
        incident_type,
        resolution_strategy_type,
        diagnosis,
        measure,
        recommendation,
      });

      await resolution.save();
    }

    return NextResponse.json({ success: true, incident });
  } catch (err) {
    console.error("Error updating incident:", err);
    return NextResponse.json({ error: "Failed to update incident" }, { status: 500 });
  }
}
