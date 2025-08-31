// app/api/incidents/volume/route.ts
import { NextResponse } from "next/server";
import { connectDatabase } from '@/lib/connect';
import { Incident } from '@/lib/models'; 
import { subDays, subMonths, startOfYear } from "date-fns";

type IncidentData = {
  date: string;
  incidents: number;
};

export async function GET(req: Request) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d"; // default = 30 days

    let startDate: Date;

    if (period === "30d") {
      startDate = subDays(new Date(), 30);
    } else if (period === "90d") {
      startDate = subDays(new Date(), 90);
    } else if (period === "6m") {
      startDate = subMonths(new Date(), 6);
    } else if (period === "1y") {
      startDate = subMonths(new Date(), 12);
    } else if (period === "ytd") {
      startDate = startOfYear(new Date());
    } else {
      return NextResponse.json(
        { error: "Invalid period" },
        { status: 400 }
      );
    }

    // aggregate incidents by day
    const data = await Incident.aggregate<IncidentData>([
      {
        $match: {
          created_at: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" },
          },
          incidents: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: "$_id",
          incidents: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching incident volume:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
