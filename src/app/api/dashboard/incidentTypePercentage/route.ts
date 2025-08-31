import { NextResponse } from "next/server";
import { connectDatabase } from '@/lib/connect';
import { Incident} from '@/lib/models'; 

function getStartDate(period: string | null): Date | null {
  const now = new Date();
  if (!period) return null;

  switch (period) {
    case "7d":
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

    const data = await Incident.aggregate([
      // 1. Filter incidents by creation date
      { $match: incidentMatchStage },

      // 2. Look up the resolution documents to get the incident_type
      {
        $lookup: {
          from: "incidentresolutions", 
          localField: "_id", 
          foreignField: "incident_id", 
          as: "resolutionInfo"
        }
      },

      // 3. Only include incidents that have been resolved (and thus have a type)
      // Use $ne: [] to check if the array is not empty
      { $match: { resolutionInfo: { $ne: [] } } },

      // 4. Unwind to work with a single resolution document per incident
      // Some incidents might have multiple resolutions? Your schema suggests 1:1, but this is safe.
      { $unwind: "$resolutionInfo" },

      // 5. Group by incident type to get the count for each type
      {
        $group: {
          _id: "$resolutionInfo.incident_type",
          count: { $sum: 1 } // Count the number of incidents per type
        }
      },

      // 6. Group all results to calculate the total count
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          results: { $push: { type: "$_id", count: "$count" } }
        }
      },

      // 7. Unwind the results to calculate the percentage for each type
      { $unwind: "$results" },

      // 8. Project the final format: type, count, and percentage
      {
        $project: {
          _id: 0,
          incidentType: "$results.type",
          count: "$results.count",
          percentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$results.count", "$total"] },
                  100
                ]
              },
              2 // Round the percentage to 2 decimal places
            ]
          }
        }
      },

      // 9. Sort by percentage descending (most common first)
      { $sort: { percentage: -1 } }
    ]);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching incident type distribution:", error);
    return NextResponse.json(
      { error: "Failed to fetch incident type distribution" },
      { status: 500 }
    );
  }
}