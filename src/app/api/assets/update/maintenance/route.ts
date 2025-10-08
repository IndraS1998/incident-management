// app/api/assets/[asset_id]/maintenance/route.ts
import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/connect";
import { Asset, AssetMaintenance } from "@/lib/models";
import { Types } from "mongoose";

const ALLOWED_MAINTENANCE_TYPES = ['routine', 'repair', 'upgrade'];

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
