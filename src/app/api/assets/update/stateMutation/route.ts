import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/connect";
import { Asset, AssetStateHistory,AssetState } from "@/lib/models";
import mongoose,{ Types } from "mongoose";

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
    const stateMutations = await AssetStateHistory.find({ asset_id })
      .populate({
        path: 'changed_by',
        select: 'admin_id name email phone role status -_id',
      })
      .sort({ changed_at: -1 });
    if (!stateMutations) {
      return NextResponse.json(
        { message: 'No maintenance records found for this asset.' },
        { status: 404 }
      );
    }
    return NextResponse.json(stateMutations, { status: 200 });
  }catch(err){
    console.error(`Failed to fetch asset with ID: ${asset_id}`, err);
    return NextResponse.json(
      { message: 'An unexpected error occurred on the server.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  await connectDatabase();
  const body = await req.json();
  const { new_state, changed_by, notes, asset_id } = body;

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
