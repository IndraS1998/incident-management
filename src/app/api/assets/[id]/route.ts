import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Asset } from '@/lib/models'; // Adjust the import path to your models
import { connectDatabase } from '@/lib/connect'; // Adjust the import path to your DB connector

/**
 * @route   GET /api/assets/[id]
 * @desc    Fetch a single asset and its details by its MongoDB _id.
 * If the asset state is 'in_use', location details are joined.
 * @access  Public (or add authentication middleware)
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // The asset's _id is extracted from the URL parameters
  const { id } = params;

  // --- Validation ---
  // Before querying, check if the provided ID is a valid MongoDB ObjectId format.
  // This prevents malformed queries and potential errors.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: 'Error: Invalid asset ID format.' },
      { status: 400 } // Bad Request
    );
  }

  try {
    await connectDatabase();

    // Use an aggregation pipeline, which is highly efficient for this kind of lookup and join.
    const assetPipeline = await Asset.aggregate([
      // --- Stage 1: Match ---
      // This is the most crucial stage for this endpoint. It filters the
      // entire collection down to the single document with the matching _id.
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },

      // --- Stage 2: Join with AssetType collection ---
      {
        $lookup: {
          from: 'assettypes',
          localField: 'type_id',
          foreignField: '_id',
          as: 'assetTypeInfo',
        },
      },
      {
        $unwind: {
          path: '$assetTypeInfo',
          preserveNullAndEmptyArrays: true,
        },
      },

      // --- Stage 3: Join with Room (office) collection for location ---
      {
        $lookup: {
          from: 'rooms',
          localField: 'office_id',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      {
        $unwind: {
          path: '$roomInfo',
          preserveNullAndEmptyArrays: true,
        },
      },

      // --- Stage 4: Join with Department from within the room data ---
      {
        $lookup: {
          from: 'departments',
          localField: 'roomInfo.department_id',
          foreignField: '_id',
          as: 'departmentInfo',
        },
      },
      {
        $unwind: {
          path: '$departmentInfo',
          preserveNullAndEmptyArrays: true,
        },
      },

      // --- Stage 5: Project and Shape the Final Output ---
      // This stage constructs the final JSON object to be returned.
      {
        $project: {
          // Explicitly include the fields you want to return.
          _id: 1,
          asset_id: 1,
          model_number: 1,
          state: 1,
          date_in_production: 1,
          lifespan: 1,
          maintenance_frequency: 1,
          criticality: 1,
          asset_type: '$assetTypeInfo.name',

          // Conditionally add the entire 'location' object.
          location: {
            $cond: {
              if: { $eq: ['$state', 'in_use'] },
              then: {
                room_number: '$roomInfo.room_number',
                floor: '$roomInfo.floor_number',
                building: '$roomInfo.building_name',
                department: '$departmentInfo.name',
              },
              else: '$$REMOVE', // If not 'in_use', the location field will be omitted entirely.
            },
          },
        },
      },
    ]);

    // --- Handle Not Found ---
    // If the pipeline returns an empty array, it means no asset with that _id exists.
    if (!assetPipeline || assetPipeline.length === 0) {
      return NextResponse.json(
        { message: `Asset with ID "${id}" not found.` },
        { status: 404 } // Not Found
      );
    }

    // --- Success Response ---
    // The result of an aggregation is always an array. For this query, it will
    // contain just one object, so we return the first element.
    return NextResponse.json(assetPipeline[0], { status: 200 });

  } catch (error) {
    console.error(`Failed to fetch asset with ID: ${id}`, error);
    return NextResponse.json(
      { message: 'An unexpected error occurred on the server.' },
      { status: 500 } // Internal Server Error
    );
  }
}
