import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/connect";
import { Incident } from "@/lib/models";
import { Types, PipelineStage } from "mongoose";

// Enum for clarity, matching your models file
enum IncidentResolutionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export async function POST(req: Request) {
  try {
    await connectDatabase();
    const body = await req.json();

    const { severity, department, startDate, endDate } = body;

    // --- Aggregation Pipeline ---

    // Stage 1: Initial match for status and other direct fields
    // This is the base filter for fields on the Incident model itself.
    const matchConditions: Record<string, unknown> = {
      status: IncidentResolutionStatus.IN_PROGRESS,
    };

    // More robust check for severity to ensure it's a non-empty string
    if (severity && typeof severity === 'string' && severity.trim() !== '') {
      matchConditions.severity = severity.trim();
    }

    if (startDate || endDate) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      // Add one day to the end date to make the range inclusive
      if (endDate) {
          const end = new Date(endDate);
          end.setDate(end.getDate() + 1);
          dateFilter.$lte = end;
      }
      // Note: Your schema uses 'created_at', not 'eventDate'.
      matchConditions.created_at = dateFilter;
    }

    // Initialize the aggregation pipeline with the first $match stage
    const pipeline: PipelineStage[] = [{ $match: matchConditions }];


    // Stage 2: Perform a lookup (JOIN) to the 'rooms' collection
    // This fetches the corresponding Room document for each Incident
    pipeline.push({
      $lookup: {
        from: 'rooms', // The name of the collection to join with (Mongoose pluralizes model names)
        localField: 'room_id', // The field from the 'incidents' collection
        foreignField: '_id', // The field from the 'rooms' collection
        as: 'roomDetails' // The name of the new array field to add to the incident documents
      }
    });

    // Stage 3: Unwind the results from the lookup
    // The $lookup stage creates an array ('roomDetails'). $unwind deconstructs it
    // to create a separate document for each element, effectively making it a single object.
    pipeline.push({
        $unwind: '$roomDetails'
    });

    // Stage 4: Add a second match stage to filter by the joined data (Department)
    if (department && Types.ObjectId.isValid(department)) {
      pipeline.push({
        $match: {
          // Now we can filter on the department_id from the joined room document
          'roomDetails.department_id': new Types.ObjectId(department)
        }
      });
    }

    // Stage 5 (Optional): Project the final shape of the output
    // This cleans up the output to avoid sending the entire 'roomDetails' object.
    pipeline.push({
        $project: {
            // Include all original incident fields
            incident_id: 1,
            description: 1,
            severity: 1,
            status: 1,
            reporter_full_name: 1,
            reporter_email: 1,
            reporter_contact: 1,
            room_id: 1, // You might want to populate this later if needed
            created_at: 1,
            updated_at: 1,
            // You can also include specific fields from the room if you want
            "room_number": "$roomDetails.room_number",
            "building_name": "$roomDetails.building_name"
        }
    })

    // Log the final pipeline to the console for debugging
    console.log("Executing aggregation pipeline:", JSON.stringify(pipeline, null, 2));

    const incidents = await Incident.aggregate(pipeline);

    return NextResponse.json({ success: true, data: incidents });
  } catch (error) {
    console.error("Error filtering incidents:", error);
    if (error instanceof Error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
    }
    return NextResponse.json(
      { success: false, error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}

