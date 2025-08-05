import { initializeDatabase } from '../../../lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { success: false, error: "Initialization failed" },
      { status: 500 }
    );
  }
}
