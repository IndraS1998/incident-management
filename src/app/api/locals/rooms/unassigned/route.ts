import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import {Room} from '@/lib/models';

export async function GET() {
    try {
        await connectDatabase();
        const rooms = await Room.find({ 
            department_id: { $exists: false } 
            }).select('room_number floor_number building_name _id');
        return NextResponse.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch rooms' }, { status: 500 });
    }
}