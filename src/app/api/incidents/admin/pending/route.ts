import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import { Incident } from '@/lib/models';

export async function GET(req:Request){
    const {searchParams} = new URL(req.url)
    const getCount = searchParams.get('count') === 'true'
    try{
        await connectDatabase();
        if(getCount){
            const count = await Incident.countDocuments({status: 'in_progress'});
            return NextResponse.json({ count })
        }else{
            const incidents = await Incident.find({status:'in_progress'}).populate({
                    path: 'room_id',
                    select: 'room_number floor_number building_name department_id',
                    populate: {
                        path: 'department_id',
                        model: 'Department',
                        select: 'name contact'
                    }
                })
                .sort({ created_at: -1 }) // Newest first
                .lean()
            const formattedIncidents = incidents.map(incident => {
                const room = incident.room_id; // Type assertion for populated data
                return {
                    ...incident,
                    room_number: room?.room_number,
                    floor_number: room?.floor_number,
                    building_name: room?.building_name,
                    department: room?.department_id ? {
                        name: room.department_id.name,
                        contact: room.department_id.contact
                    } : null
                };
            });
            return NextResponse.json(formattedIncidents);
        }
    }catch(error){
        console.error('Error fetching floors:', error);
        return NextResponse.json({ success: false, message: 'Failed to fetch floors' }, { status: 500 });
    }
}

