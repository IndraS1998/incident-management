import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import { Admin } from '@/lib/models';


export async function POST(request: Request) {
    try{
        const { admin_id, password_hash } = await request.json();

        await connectDatabase();

        const admin = await Admin.findOne({ admin_id });

        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'Admin not found' },
                { status: 404 }
            );
        }

        if(admin.status !== 'active') {
            return NextResponse.json(
                { success: false, message: 'Admin account is inactive' },
                { status: 403 }
            );
        }

        if (admin.password_hash !== password_hash) {
            return NextResponse.json(
                { success: false, message: 'Invalid password' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Login successful',data:admin },
            { status: 200 }
        );

    }catch(error){
        console.error('Connection error', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Failed to login',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}