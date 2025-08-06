// src/app/api/admin/create-test/route.ts
import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import { Admin } from '@/lib/models';

export async function POST() {
  try {
    await connectDatabase();

    // Create test admin data
    const testAdmin = {
      admin_id: 'test_admin_1',
      name: 'Test Admin',
      email: 'test.admin@example.com',
      phone: '+1234567890',
      password_hash: '$2a$10$examplehashedpassword', // In production, use proper hashing
      status: 'active',
      role: 'superadmin'
    };

    // Check if test admin already exists
    const existingAdmin = await Admin.findOne({ admin_id: 'test_admin_1' });
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, message: 'Test admin already exists' },
        { status: 400 }
      );
    }

    // Create new admin
    const admin = new Admin(testAdmin);
    await admin.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Test admin created successfully',
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating test admin:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create test admin',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  );
}