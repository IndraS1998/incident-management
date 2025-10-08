import { NextRequest, NextResponse  } from 'next/server';
import mongoose from 'mongoose';
import { Asset } from '@/lib/models';
import { connectDatabase } from '@/lib/connect';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json(
      { message: 'Error: Missing asset ID.' },
      { status: 400 }
    )
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: 'Error: Invalid asset ID format.' },
      { status: 400 }
    );
  }

  try {
    await connectDatabase();

    const assetPipeline = await Asset.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
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

    if (!assetPipeline || assetPipeline.length === 0) { 
      return NextResponse.json(
        { message: `Asset with ID "${id}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(assetPipeline[0], { status: 200 });

  } catch (error) {
    console.error(`Failed to fetch asset with ID: ${id}`, error);
    return NextResponse.json(
      { message: 'An unexpected error occurred on the server.' },
      { status: 500 }
    );
  }
}