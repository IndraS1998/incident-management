import { NextResponse } from 'next/server'
import { connectDatabase } from '@/lib/connect'
import { Asset, AssetState, AssetStateHistory } from '@/lib/models' // adjust import path
import { Types } from 'mongoose'

export async function POST(req: Request) {
  try {
    await connectDatabase()
    const body = await req.json()

    const {
      type, // type_id
      name,
      model_number,
      lifespan,
      maintenance_frequency,
      state,
      office_id,
      criticality,
      date_in_production,
      changed_by, // admin performing creation/change
      notes,
    } = body

    // ✅ Basic validation
    if (
      !type ||
      !name ||
      !model_number ||
      !lifespan ||
      !maintenance_frequency ||
      !state
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // ✅ Generate a unique asset_id (you can improve this logic)
    const assetCount = await Asset.countDocuments()
    const asset_id = `AST-${String(assetCount + 1).padStart(4, '0')}`

    // ✅ Create the asset
    const asset = await Asset.create({
      asset_id,
      type_id: new Types.ObjectId(type),
      model_number,
      lifespan,
      maintenance_frequency,
      state,
      criticality,
      office_id: office_id ? new Types.ObjectId(office_id) : undefined,
      date_in_production: date_in_production
        ? new Date(date_in_production)
        : undefined,
    })

    // ✅ Optionally record asset state history
    if (changed_by && state) {
      await AssetStateHistory.create({
        history_id: `HIS-${Date.now()}`,
        asset_id: asset._id,
        previous_state: AssetState.IN_STOCK,
        new_state: state,
        changed_by: new Types.ObjectId(changed_by),
        notes: notes || `Asset created with state ${state}`,
      })
    }

    return NextResponse.json(
      { message: 'Asset created successfully', asset },
      { status: 201 }
    )
  } catch (error) {
    console.log('Error creating asset:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

