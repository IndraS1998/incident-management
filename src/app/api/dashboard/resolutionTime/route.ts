import { NextResponse } from "next/server";
import { connectDatabase } from '@/lib/connect';
import { Incident} from '@/lib/models';

function getStartDate(period: string | null): Date | null {
  const now = new Date();
  if (!period) return null;

  switch (period) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case "30d":
      return new Date(now.setDate(now.getDate() - 30));
    case "90d":
      return new Date(now.setDate(now.getDate() - 90));
    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return null;
  }
}

// Define a type for the match stage filter
interface IncidentMatchStage {
  created_at?: {
    $gte: Date;
  };
}

export async function GET(req: Request) {
  try {
    await connectDatabase();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");
    const startDate = getStartDate(period);

    const incidentMatchStage: IncidentMatchStage = {};

    if (startDate) {
      incidentMatchStage.created_at = { $gte: startDate };
    }

    // Updated aggregation pipeline to include min and max resolution times
    const data = await Incident.aggregate([
      // 1. Filter incidents by date
      { $match: incidentMatchStage },

      // 2. Look up resolution documents
      {
        $lookup: {
          from: "incidentresolutions", 
          localField: "_id", 
          foreignField: "incident_id", 
          as: "resolutionInfo"
        }
      },

      // 3. Only include resolved incidents
      { $match: { "resolutionInfo.0": { $exists: true } } },

      // 4. Unwind the resolution array
      { $unwind: "$resolutionInfo" },

      // 5. Calculate resolution time in hours
      {
        $addFields: {
          resolutionTimeHours: {
            $divide: [
              {
                $subtract: [
                  "$resolutionInfo.resolution_time",
                  "$created_at"
                ]
              },
              1000 * 60 * 60 // ms → hours
            ]
          }
        }
      },

      // 6. Group by incident type with multiple statistics
      {
        $group: {
          _id: "$resolutionInfo.incident_type",
          avgResolutionTime: { $avg: "$resolutionTimeHours" },
          minResolutionTime: { $min: "$resolutionTimeHours" },
          maxResolutionTime: { $max: "$resolutionTimeHours" },
          count: { $sum: 1 }
        }
      },

      // 7. Project the final format
      {
        $project: {
          incidentType: "$_id",
          avgResolutionTime: { $round: ["$avgResolutionTime", 2] },
          minResolutionTime: { $round: ["$minResolutionTime", 2] },
          maxResolutionTime: { $round: ["$maxResolutionTime", 2] },
          count: 1,
          _id: 0
        }
      },

      // 8. NEW: Sort from fastest to slowest average resolution time
      { $sort: { avgResolutionTime: 1 } } // 1 = ascending (lowest to highest)
    ]);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching resolution time:", error);
    return NextResponse.json(
      { error: "Failed to fetch resolution time" },
      { status: 500 }
    );
  }
}