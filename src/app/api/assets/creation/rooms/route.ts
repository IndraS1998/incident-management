import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import { Room } from '@/lib/models';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectDatabase();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department_id');
    const building = searchParams.get('building_name');
    const floor = searchParams.get('floor_number');

    // Validate all required parameters
    if (!department || !building || !floor) {
        return NextResponse.json(
          { success: false, message: 'department_id, building_name, and floor_number are required' },
          { status: 400 }
        );
    }

    // Convert parameters to correct types
    let departmentId: mongoose.Types.ObjectId;
    let floorNumber: number;
    
    try {
      departmentId = new mongoose.Types.ObjectId(department);
      floorNumber = Number(floor);
      
      if (isNaN(floorNumber)) {
        throw new Error('Invalid floor number');
      }
    } catch (error) {
        return NextResponse.json(
            { 
            success: false, 
            message: error instanceof Error ? error.message : 'Invalid parameter format',
            details: {
                department_id: 'Must be a valid ObjectId',
                floor_number: 'Must be a number'
            }
            },
            { status: 400 }
        );
    }

    // Query rooms with proper typing
    const rooms = await Room.find({
      department_id: departmentId,
      building_name: building,
      floor_number: floorNumber
    })
    .populate({
      path: 'department_id',
      select: 'department_id name contact' // Only include these fields
    })
    .sort({ room_number: 1 }); // Sort by room number ascending

    if (rooms.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch rooms',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}