import { NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/connect';
import {Room,IRoom} from '@/lib/models';

type GroupedRooms = {
  building_name: string;
  floors: {
    floor_number: number;
    rooms: IRoom[];
  }[];
};

export async function GET() {
  try {
    await connectDatabase();

    const rooms = await Room.find()
        .populate("department_id")
        .lean<IRoom[]>();

    const grouped: GroupedRooms[] = rooms.reduce<GroupedRooms[]>((acc, room) => {
        const { building_name, floor_number } = room;

        // Find or create building entry
        let building = acc.find((b) => b.building_name === building_name);
        if (!building) {
        building = { building_name, floors: [] };
        acc.push(building);
        }

        // Find or create floor entry
        let floor = building.floors.find((f) => f.floor_number === floor_number);
        if (!floor) {
        floor = { floor_number, rooms: [] };
        building.floors.push(floor);
        }

        // Add room to the floor
        floor.rooms.push(room);

        return acc;
    }, []);

    // Sort rooms inside each floor
    grouped.forEach((building) => {
        building.floors.forEach((floor) => {
        floor.rooms.sort((a, b) => {
            const numA = parseInt(a.room_number, 10);
            const numB = parseInt(b.room_number, 10);

            // If both are valid numbers, compare numerically
            if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
            }

            // Otherwise fall back to string comparison
            return a.room_number.localeCompare(b.room_number, undefined, {
            numeric: true,
            sensitivity: "base",
            });
        });
        });

        // Optional: also sort floors by floor_number
        building.floors.sort((a, b) => a.floor_number - b.floor_number);
    });

    // Optional: also sort buildings alphabetically
    grouped.sort((a, b) =>
        a.building_name.localeCompare(b.building_name, undefined, {
        numeric: true,
        sensitivity: "base",
        })
    );

    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    try {
        const { room_number, building_name, floor_number } = await request.json();
        await connectDatabase();
        await Room.create({ room_number, building_name, floor_number });
        return NextResponse.json({ success: true, message: 'Room created successfully' }, { status: 201 });
    } catch (error) {
        console.error('Error creating room:', error);
        return NextResponse.json({ success: false, message: 'Failed to create room' }, { status: 500 });
    }
}