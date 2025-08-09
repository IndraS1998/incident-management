import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import {Room,Department,AdminDepartment} from '@/lib/models';
import mongoose from 'mongoose';

export async function GET(){
    try{
        await connectDatabase();
        const departments = await Department.aggregate([
        {
            $lookup: {
            from: 'rooms',
            localField: '_id',
            foreignField: 'department_id',
            as: 'rooms'
            }
        },
        {
            $lookup: {
            from: 'admindepartments',
            localField: '_id',
            foreignField: 'department_id',
            as: 'adminLinks'
            }
        },
       {
            $lookup: {
                from: 'admins',
                let: { adminIds: '$adminLinks.admin_id' },
                pipeline: [
                    { $match: { $expr: { $in: ['$_id', '$$adminIds'] } } },
                    { $match: { role: { $in: ['incident_manager', 'superadmin'] } } }
                ],
                as: 'managers'
            }
        },
        {
            $project: {
            _id: 1,
            department_id: 1,
            name: 1,
            contact: 1,
            roomCount: { $size: '$rooms' },
            rooms: {
                $map: {
                input: '$rooms',
                as: 'room',
                in: {
                    room_number: '$$room.room_number',
                    floor_number: '$$room.floor_number',
                    building_name: '$$room.building_name'
                }
                }
            },
            managerCount: { $size: '$managers' },
            managers: {
                $map: {
                input: '$managers',
                as: 'admin',
                in: {
                    name: '$$admin.name',
                    email: '$$admin.email',
                    role: '$$admin.role'
                }
                }
            }
            }
        }]);
        return NextResponse.json(departments);
    }catch(error){
        console.error('Error fetching departments:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch departments' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await mongoose.startSession();
    try {
        const { name, contact, rooms, managers, department_id } = await req.json();
        session.startTransaction();
        // 1. Create Department
        const [newDept] = await Department.create([{
            department_id,
            name,
            contact
        }], { session });
        // 2. Assign Rooms (if provided)
        if (rooms?.length) {
            await Room.updateMany(
                { _id: { $in: rooms }, department_id: { $exists: false } },
                { $set: { department_id: newDept._id } },
                { session }
            );
        }
        // 3. Assign Admins (if provided)
        if (managers.length > 0) {
            const adminDeptLinks = managers.map((adminId: string) => ({
                admin_id: new mongoose.Types.ObjectId(adminId),
                department_id: newDept._id
            }));
            await AdminDepartment.insertMany(adminDeptLinks, { session });
        }

        await session.commitTransaction();
        return NextResponse.json(newDept);
    } catch (error) {
        await session.abortTransaction(); // 🔹 Rollback on error
        console.error('Error creating department transaction:', error);
        return NextResponse.json(
            { success: false, message: 'Transaction failed' },
            { status: 500 }
        );
    } finally {
        session.endSession();
    }
}
