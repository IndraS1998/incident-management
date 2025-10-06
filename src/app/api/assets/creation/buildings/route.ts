import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import {Room,Building} from '@/lib/models';

export async function GET(request: Request){
    try{
        await connectDatabase();
        const { searchParams } = new URL(request.url);
        const department = searchParams.get('department_id');

        if (!department) {
            return NextResponse.json(
                { success: false, message: 'department_id is required' },
                { status: 400 }
            );
        }
        // 1. Get building names that have rooms for this department
        const buildingNames = await Room.distinct('building_name', { 
            department_id: department 
        });
         // 2. Get complete building documents
        const buildings = await Building.find({
            building_name: { $in: buildingNames }
        });
        return NextResponse.json(buildings);
    }catch(error){
        console.error('Error fetching buildings:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch buildings' }, { status: 500 });
    }
}