import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import {Floor} from '@/lib/models';

export async function GET(request: Request) {
    try {
        await connectDatabase();
        const { searchParams } = new URL(request.url);
        const buildingName = searchParams.get('building_name');
        let floors;
        if (buildingName) {
            floors = await Floor.find({ building_name: buildingName }).lean();
        } else {
            floors = await Floor.aggregate([
                {
                    $group: {
                    _id: "$building_name",
                    floors: { $push: "$$ROOT" },
                    },
                },
            ]);
        }
        return NextResponse.json(floors);
    } catch (error) {
        console.error('Error fetching floors:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch floors' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { floor_number, building_name } = await request.json();
        await connectDatabase();
        await Floor.create({ floor_number, building_name });
        return NextResponse.json({ success: true, message: 'Floor created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error creating floor:', error);
        return NextResponse.json({ success: false, message: 'Failed to create floor' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const { _id, floor_number, building_name } = await request.json();
        await connectDatabase();
        const updatedFloor = await Floor.findByIdAndUpdate(
            _id,
            { floor_number, building_name },
            { new: true }
        );
        if (!updatedFloor) {
            return NextResponse.json({ success: false, message: 'Floor not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Floor updated successfully' });
    } catch (error) {
        console.error('Error updating floor:', error);
        return NextResponse.json({ success: false, message: 'Failed to update floor' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { _id } = await request.json();
        await connectDatabase();
        const deletedFloor = await Floor.findByIdAndDelete(_id);
        if (!deletedFloor) {
            return NextResponse.json({ success: false, message: 'Floor not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Floor deleted successfully' });
    } catch (error) {
        console.error('Error deleting floor:', error);
        return NextResponse.json({ success: false, message: 'Failed to delete floor' }, { status: 500 });
    }
}