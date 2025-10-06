import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import { AssetType } from '@/lib/models';

export async function GET() {
    try {
        await connectDatabase();
        const assetTypes = await AssetType.find().sort({ name: 1 }); // Sort alphabetically by name
        return NextResponse.json(assetTypes, { status: 200 });
    } catch (error) {
        console.error('Error fetching asset types:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request){
    const { name, description } = await req.json();
    if (!name || !description) {
        return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }
    try {
        await connectDatabase();
        // Check for existing asset type with the same name (case-insensitive)
        const existing = await AssetType.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return NextResponse.json({ error: 'Asset type with this name already exists' }, { status: 400 });
        }
        const newAssetType = new AssetType({
            name,
            description
        });
        await newAssetType.save();
        return NextResponse.json(newAssetType, { status: 201 });
    } catch (error) {
        console.error('Error creating asset type:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}