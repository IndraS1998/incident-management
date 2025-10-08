import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/connect";
import { Asset, AssetStateHistory,AssetState } from "@/lib/models";
import { Types } from "mongoose";

export async function PATCH(req: Request) {
  await connectDatabase();
  const body = await req.json();
  const { new_state, changed_by, notes, asset_id } = body;
  console.log(new_state)

  try {
    if (!Object.values(AssetState).includes(new_state))
      return NextResponse.json({ error: "Invalid asset state" }, { status: 400 });
    
    const asset = await Asset.findById(asset_id);
    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    const previous_state = asset.state;

    // Log state change
    const history = await AssetStateHistory.create({
      history_id: `ST-${Date.now()}`,
      asset_id: asset._id,
      previous_state,
      new_state,
      changed_at: new Date(),
      changed_by: new Types.ObjectId(changed_by),
      notes,
    });

    // Update asset state
    asset.state = new_state;
    await asset.save();

    return NextResponse.json({ message: "Asset state updated successfully", history }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
