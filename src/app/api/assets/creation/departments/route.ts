import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import {Department} from '@/lib/models';

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