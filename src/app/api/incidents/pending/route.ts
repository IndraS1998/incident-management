import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import { Incident,Room,AdminDepartment } from '@/lib/models';
import {Types} from 'mongoose'

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
                status: 'in_progress'
            });
            return NextResponse.json({ count });
        } else {
            // Step 3b: Return all incidents (populating room & department info)
            const incidents = await Incident.find({ room_id: { $in: roomIds },status: 'in_progress' })
                .populate({
                    path: 'room_id',
                    select: 'room_number floor_number building_name department_id',
                    populate: {
                        path: 'department_id',
                        model: 'Department',
                        select: 'name contact department_id'
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

