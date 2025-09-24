import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import { Admin } from '@/lib/models';
import { createAdministratorId } from '@/lib/functions';

export async function GET() {
    try{
        await connectDatabase();
        // Fetch all administrators from the database
        const administrators = await Admin.find().lean();
        return NextResponse.json(administrators);
    }catch(error) {
        console.error('Error fetching administrators:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch administrators' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, email, phone, role, status } = await request.json();
        const adminId = createAdministratorId(name);
        await connectDatabase();
        // Create a new administrator in the database
        const newAdmin = await Admin.create({ admin_id: adminId, password_hash: adminId, name, email, phone, role, status });
        return NextResponse.json({newAdmin, success: true, message: 'Administrator created successfully'}, { status: 201 });
    } catch (error) {
        console.error('Error creating administrator:', error);
        return NextResponse.json({ success: false, message: 'Failed to create administrator' }, { status: 500 });
    }
}

export async function PATCH(req: Request){
    try{
        const {_id,role,status} = await req.json();
        await connectDatabase();
        // Update the administrator in the database
        const updatedAdmin = await Admin.findByIdAndUpdate(_id, { role, status }, { new: true });
        return NextResponse.json({ updatedAdmin, success: true, message: 'Administrator updated successfully' });
    }catch(error){
        console.log(error)
        return NextResponse.json({ success: false, message: 'Failed to update administrator' }, { status: 500 });
    }
}

export async function PUT(req: Request){
    try{
        const {_id,password_hash,phone,email} = await req.json();
        await connectDatabase();
        // Update the administrator in the database
        const updatedAdmin = await Admin.findByIdAndUpdate(_id, { password_hash, phone, email }, { new: true });
        return NextResponse.json({ updatedAdmin, success: true, message: 'Administrator updated successfully' });
    }catch(error){
        console.log(error)
        return NextResponse.json({ success: false, message: 'Failed to update administrator' }, { status: 500 });
    }
}