import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import {Room,Floor} from '@/lib/models';
import mongoose from 'mongoose';

export async function GET(request: Request){
    try{
        await connectDatabase();
        const { searchParams } = new URL(request.url);
        const department = searchParams.get('department_id');
        const building = searchParams.get('building_name')
        // Validate inputs
        if (!department || !building) {
            return NextResponse.json(
                { success: false, message: 'Both department_id and building_name are required' },
                { status: 400 }
            );
        }
        // Convert department_id to ObjectId
        let departmentId;
        try {
            departmentId = new mongoose.Types.ObjectId(department);
        } catch (error) {
            console.log(error)
            return NextResponse.json(
                { success: false, message: 'Invalid department_id format' },
                { status: 400 }
            );
        }

        // Get distinct floors with proper typing
       const floorNumbers = await Room.distinct('floor_number', { 
            department_id: departmentId,
            building_name: building
        });

        // Get complete floor documents
        const floors = await Floor.find({
            floor_number: { $in: floorNumbers },
            building_name: building
        });

        return NextResponse.json(floors);
    }catch(error){
        console.error('Error fetching buildings:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch buildings' }, { status: 500 });
    }
}