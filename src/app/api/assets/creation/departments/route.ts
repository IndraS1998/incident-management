import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import {Department,AdminDepartment} from '@/lib/models';
import mongoose from 'mongoose';

export async function GET(){
    try{
        await connectDatabase()
        const departments = await Department.find({}).lean()
        return NextResponse.json(departments);
    }catch(error){
        console.error('Error fetching rooms with departments:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch rooms' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request){
    const body = await req.json()
    const {adminId} = body
    console.log(adminId)
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }
    try{
        await connectDatabase()
        // Step 1: Find all department IDs linked to this admin
        const adminDepartments = await AdminDepartment.find({ admin_id: adminId }).select('department_id');

        if (!adminDepartments.length) {
        return NextResponse.json({ departments: [] });
        }

        // Extract unique department IDs
        const departmentIds = adminDepartments.map((ad) => ad.department_id);

        // Step 2: Fetch actual Department details
        const departments = await Department.find({ _id: { $in: departmentIds } })
        .select('_id department_id name contact')
        .lean();

        return NextResponse.json(departments);
    }catch(e){
        console.error('Error fetching departments for admin:', e);
        return NextResponse.json(
        { error: 'Failed to fetch departments' },
        { status: 500 }
        );
    }
}