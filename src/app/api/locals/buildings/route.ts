import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import { Building } from '@/lib/models';

export async function GET() {
    try{
        await connectDatabase();
        // Fetch all buildings from the database
        const buildings = await Building.find().lean();
        return NextResponse.json(buildings);
    }catch(error) {
        console.error('Error fetching buildings:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch buildings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { building_name } = await request.json();
        await connectDatabase();
        // Create a new building in the database
        await Building.create({ building_name });
        return NextResponse.json({ success: true, message: 'Building created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error creating building:', error);
        return NextResponse.json({ success: false, message: 'Failed to create building' }, { status: 500 });
    }
}

export async function PATCH(req: Request){
    try{
        const { _id, building_name } = await req.json();
        await connectDatabase();
        // Update the building in the database
        await Building.findByIdAndUpdate(_id, { building_name }, { new: true });
        return NextResponse.json({ success: true, message: 'Building updated successfully' });
    }catch(error){
        console.log(error);
        return NextResponse.json({ success: false, message: 'Failed to update building' }, { status: 500 });
    }
}

export async function DELETE(req: Request){
    try{
        const { _id } = await req.json();
        await connectDatabase();
        // Delete the building from the database
        const deletedBuilding = await Building.findByIdAndDelete(_id);
        if (!deletedBuilding) {
            return NextResponse.json({ success: false, message: 'Building not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, message: 'Building deleted successfully' });
    }catch(error){
        console.log(error);
        return NextResponse.json({ success: false, message: 'Failed to delete building' }, { status: 500 });
    }
}