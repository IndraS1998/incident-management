// app/api/departments/assign-admin/route.ts
import { NextResponse } from "next/server";
import { AdminDepartment,Admin,Room } from "@/lib/models";
import { connectDatabase } from '@/lib/connect';

export async function GET(req: Request) {
    const {searchParams}= new URL(req.url);
    const departmentId = searchParams.get('departmentId');
    if(!departmentId){
        return NextResponse.json({ error: 'invalid URL'}, { status: 500 });
    }
    try {
        await connectDatabase();
        const assigned = await AdminDepartment.find({ department_id: departmentId }).select("admin_id");
        const assignedIds = assigned.map((a) => a.admin_id);

        // Find all admins not in assignedIds
        const unassignedAdmins = await Admin.find({
        _id: { $nin: assignedIds },
        }).lean();

        return NextResponse.json({ success: true, admins: unassignedAdmins });
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'unexpected error'}, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDatabase();

        const { adminIds, departmentId }: { adminIds: string[]; departmentId: string } = await req.json();

        if (!adminIds || !Array.isArray(adminIds) || adminIds.length === 0 || !departmentId) {
            return NextResponse.json(
                { error: "Missing departmentId or adminIds array" },
                { status: 400 }
            );
        }

        // Prepare the data for insertion
        const relationsData = adminIds.map((adminId) => ({
            admin_id: adminId,
            department_id: departmentId,
        }));

        // Use insertMany to create all relations at once
        const relations = await AdminDepartment.insertMany(relationsData, { ordered: false });

        return NextResponse.json({ success: true, relations });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectDatabase();

        const { roomIds, departmentId }: { roomIds: string[]; departmentId: string } = await req.json();

        if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0 || !departmentId) {
        return NextResponse.json(
            { error: "Missing departmentId or roomIds array" },
            { status: 400 }
        );
        }

        // Update all rooms whose IDs are in the array
        const result = await Room.updateMany(
        { _id: { $in: roomIds } },
        { department_id: departmentId }
        );

        return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}