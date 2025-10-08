import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/connect";
import { Asset, AssetMovement } from "@/lib/models";
import { Types } from "mongoose";

export async function POST(req: Request) {
  await connectDatabase();
  const body = await req.json();
  const { to_office_id, moved_by, reason, asset_id } = body;
  console.log(to_office_id)

  try {
    const asset = await Asset.findById(asset_id);
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    const movement = await AssetMovement.create({
      movement_id: `MV-${Date.now()}`,
      asset_id: asset._id,
      from_office_id: asset.office_id,
      to_office_id: new Types.ObjectId(to_office_id),
      moved_by: new Types.ObjectId(moved_by),
      moved_at: new Date(),
      reason,
    });

    // Update asset's location
    asset.office_id = new Types.ObjectId(to_office_id);
    await asset.save();

    return NextResponse.json({ message: "Asset movement recorded successfully", movement }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
