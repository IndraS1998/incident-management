import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import {Room} from '@/lib/models';

export async function GET() {
    try {
        await connectDatabase();
        const rooms = await Room.find().lean();
        return NextResponse.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch rooms' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { room_number, building_name, floor_number } = await request.json();
        await connectDatabase();
        await Room.create({ room_number, building_name, floor_number });
        return NextResponse.json({ success: true, message: 'Room created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json({ success: false, message: 'Failed to create room' }, { status: 500 });
    }
}