// app/api/assets/[asset_id]/maintenance/route.ts
import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/connect";
import { Asset, AssetMaintenance } from "@/lib/models";
import mongoose,{ Types } from "mongoose";

const ALLOWED_MAINTENANCE_TYPES = ['routine', 'repair', 'upgrade'];

export async function GET(req: Request){
  const {searchParams} = new URL(req.url)
  const asset_id = searchParams.get('asset_id')

  if (!asset_id) {
    return NextResponse.json(
      { message: 'Error: Missing asset ID.' },
      { status: 400 }
    )
  }

  if (!mongoose.Types.ObjectId.isValid(asset_id)) {
    return NextResponse.json(
      { message: 'Error: Invalid asset ID format.' },
      { status: 400 }
    );
  }

  try{
    await connectDatabase()
    const maintenances = await AssetMaintenance.find({ asset_id })
      .populate({
        path: 'performed_by',
        select: 'admin_id name email phone role status -_id',
      })
      .sort({ performed_at: -1 });
    if (!maintenances) {
      return NextResponse.json(
        { message: 'No maintenance records found for this asset.' },
        { status: 404 }
      );
    }
    return NextResponse.json(maintenances, { status: 200 });
  }catch(err){
    console.error(`Failed to fetch asset with ID: ${asset_id}`, err);
    return NextResponse.json(
      { message: 'An unexpected error occurred on the server.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectDatabase();
  const body = await req.json();
  const { performed_by, maintenance_type, notes, next_due_date,asset_id } = body;

  // Basic validation
  if (!performed_by) {
    return NextResponse.json({ error: "performed_by is required" }, { status: 400 });
  }
  if (!maintenance_type || !ALLOWED_MAINTENANCE_TYPES.includes(maintenance_type)) {
    return NextResponse.json({ error: "maintenance_type is required and must be one of: routine, repair, upgrade" }, { status: 400 });
  }

  try {
    const asset = await Asset.findById(asset_id);
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // create maintenance record including performed_at (use provided value or now)
    const maintenance = await AssetMaintenance.create({
      maintenance_id: `MT-${Date.now()}`,
      asset_id: asset._id,
      performed_at:  new Date(),
      performed_by: new Types.ObjectId(performed_by),
      maintenance_type,
      notes,
      next_due_date: next_due_date ? new Date(next_due_date) : undefined,
    });

    return NextResponse.json({
      message: "Maintenance recorded successfully",
      maintenance,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error}, { status: 500 });
  }
}
