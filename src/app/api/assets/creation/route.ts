import { NextResponse } from 'next/server'
import { connectDatabase } from '@/lib/connect'
import { Asset, AssetState, AssetStateHistory } from '@/lib/models' // adjust import path
import { Types } from 'mongoose'


export async function GET() {
  try {
    await connectDatabase();
    const assets = await Asset.aggregate([
      // Stage 1: Join with AssetType collection
      {
        $lookup: {
          from: 'assettypes',
          localField: 'type_id',
          foreignField: '_id',
          as: 'assetTypeInfo',
        },
      },
      // Stage 2: Deconstruct the array to an object
      {
        $unwind: {
          path: '$assetTypeInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      // Stage 3: Join with Room (office) collection
      {
        $lookup: {
          from: 'rooms',
          localField: 'office_id',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      // Stage 4: Deconstruct roomInfo array
      {
        $unwind: {
          path: '$roomInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 5: Join with Department collection
      {
        $lookup: {
          from: 'departments',
          localField: 'roomInfo.department_id',
          foreignField: '_id',
          as: 'departmentInfo',
        },
      },
      // Stage 6: Deconstruct departmentInfo array
      {
        $unwind: {
          path: '$departmentInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 7: Project and shape the final output [CORRECTED]
      {
        $project: {
          _id: 1,
          asset_id: 1,
          model_number: 1,
          state: 1,
          date_in_production: 1,
          lifespan: 1,
          maintenance_frequency: 1,
          criticality: 1,
          asset_type: '$assetTypeInfo.name',
          location: {
            $cond: {
              if: { $eq: ['$state', 'in_use'] },
              then: {
                room_number: '$roomInfo.room_number',
                floor: '$roomInfo.floor_number',
                building: '$roomInfo.building_name',
                department: '$departmentInfo.name',
              },
              else: '$$REMOVE',
            },
          },
        },
      },
    ]);

    return NextResponse.json(assets, { status: 200 });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { message: "Failed to fetch assets"},
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDatabase()
    const body = await req.json()

    const {
      type, 
      model_number,
      lifespan,
      maintenance_frequency,
      state,
      office_id,
      criticality,
      date_in_production,
      changed_by, // admin performing creation/change
      notes,
    } = body

    // ✅ Basic validation
    if (
      !type ||
      !model_number ||
      !lifespan ||
      !maintenance_frequency ||
      !state
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ✅ Generate a unique asset_id (you can improve this logic)
    const assetCount = await Asset.countDocuments()
    const asset_id = `AST-${String(assetCount + 1).padStart(4, '0')}`

    // ✅ Create the asset
    const asset = await Asset.create({
      asset_id,
      type_id: new Types.ObjectId(type),
      model_number,
      lifespan,
      maintenance_frequency,
      state,
      criticality,
      office_id: office_id ? new Types.ObjectId(office_id) : undefined,
      date_in_production: date_in_production
        ? new Date(date_in_production)
        : undefined,
    })

    // ✅ Optionally record asset state history
    if (changed_by && state) {
      await AssetStateHistory.create({
        history_id: `HIS-${Date.now()}`,
        asset_id: asset._id,
        previous_state: AssetState.IN_STOCK,
        new_state: state,
        changed_by: new Types.ObjectId(changed_by),
        notes: notes || `Asset created with state ${state}`,
      })
    }

    return NextResponse.json(
      { message: 'Asset created successfully', asset },
      { status: 201 }
    )
  } catch (error) {
    console.log('Error creating asset:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

