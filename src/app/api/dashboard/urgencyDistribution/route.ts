// src/app/api/dashboard/urgencyDistribution/route.ts
import { NextResponse } from "next/server";
import { connectDatabase } from "@/lib/connect";
import { Incident } from "@/lib/models";

function getStartDate(period: string | null): Date | null {
  const now = new Date();
  if (!period) return null;

  switch (period) {
    case "7d":  return new Date(now.setDate(now.getDate() - 7));
    case "30d": return new Date(now.setDate(now.getDate() - 30));
    case "90d": return new Date(now.setDate(now.getDate() - 90));
    case "1y":  return new Date(now.setFullYear(now.getFullYear() - 1));
    default:    return null;
  }
}

interface IncidentMatchStage {
  created_at?: { $gte: Date };
}

type SeverityKey = "low" | "medium" | "high" | "critical";
type SeverityCounts = Partial<Record<SeverityKey, number>>;

export async function GET(req: Request) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");
    const startDate = getStartDate(period);

    const matchStage: IncidentMatchStage = {};
    if (startDate) matchStage.created_at = { $gte: startDate };

    const agg = await Incident.aggregate([
      // 1) filter by time
      { $match: matchStage },

      // 2) group by day + severity
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            severity: "$severity",
          },
          count: { $sum: 1 },
        },
      },

      // 3) regroup per day and build K/V pairs
      {
        $group: {
          _id: "$_id.date",
          pairs: { $push: { k: "$_id.severity", v: "$count" } },
        },
      },

      // 4) convert to object, filtering out null/empty keys (just in case)
      {
        $project: {
          _id: 0,
          date: "$_id",
          counts: {
            $arrayToObject: {
              $filter: {
                input: "$pairs",
                as: "p",
                cond: {
                  $and: [
                    { $ne: ["$$p.k", null] },
                    { $ne: ["$$p.k", ""] },
                  ],
                },
              },
            },
          },
        },
      },

      // 5) sort by date ascending
      { $sort: { date: 1 } },
    ]);

    // 6) normalize to always include all severities
    const data = (agg as Array<{ date: string; counts: SeverityCounts }>).map(
      (d) => ({
        date: d.date,
        low: d.counts.low ?? 0,
        medium: d.counts.medium ?? 0,
        high: d.counts.high ?? 0,
        critical: d.counts.critical ?? 0,
      })
    );

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching severity distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch severity distribution" },
      { status: 500 }
    );
  }
}
