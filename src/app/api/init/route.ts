import { initializeDatabase } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await initializeDatabase();
    console.log(response);
    return NextResponse.json({ success: true, message: "Database successfully updated" });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { success: false, error: "Initialization failed" },
      { status: 500 }
    );
  }
}
