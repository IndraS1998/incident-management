import { NextResponse } from "next/server";
import { connectDatabase } from '@/lib/connect';
import { Incident, IncidentResolution } from '@/lib/models'; 

export async function GET() {
  try {
    await connectDatabase();

    const now = new Date();

    // --- Current month range ---
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // --- Previous month range ---
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of prev month

    // 1. Incidents declared this month
    const incidentsThisMonth = await Incident.countDocuments({
      created_at: { $gte: startOfMonth, $lte: now },
    });

    // 2. Incidents declared last month
    const incidentsLastMonth = await Incident.countDocuments({
      created_at: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });

    // 3. Average resolution time (current month, in hours)
    const avgResolution = await IncidentResolution.aggregate([
      {
        $lookup: {
          from: "incidents",
          localField: "incident_id",
          foreignField: "_id",
          as: "incident",
        },
      },
      { $unwind: "$incident" },
      {
        $match: {
          "incident.created_at": { $gte: startOfMonth, $lte: now },
        },
      },
      {
        $project: {
          resolutionHours: {
            $divide: [
              { $subtract: ["$resolution_time", "$incident.created_at"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionHours: { $avg: "$resolutionHours" },
        },
      },
    ]);

    const averageResolutionTime =
      avgResolution.length > 0 ? avgResolution[0].avgResolutionHours : 0;

    // 4. Average resolution time (previous month)
    const avgResolutionPrev = await IncidentResolution.aggregate([
      {
        $lookup: {
          from: "incidents",
          localField: "incident_id",
          foreignField: "_id",
          as: "incident",
        },
      },
      { $unwind: "$incident" },
      {
        $match: {
          "incident.created_at": { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      {
        $project: {
          resolutionHours: {
            $divide: [
              { $subtract: ["$resolution_time", "$incident.created_at"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionHours: { $avg: "$resolutionHours" },
        },
      },
    ]);

    const averageResolutionTimePreviousMonth =
      avgResolutionPrev.length > 0 ? avgResolutionPrev[0].avgResolutionHours : 0;

    // 5. Most common incident type + percentage (all time)
    const typeAgg = await IncidentResolution.aggregate([
      { $match: { incident_type: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: "$incident_type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let mostCommonType = null;
    let percentage = 0;
    if (typeAgg.length > 0) {
      const totalTypes = await IncidentResolution.countDocuments({
        incident_type: { $exists: true, $ne: null },
      });
      mostCommonType = typeAgg[0]._id;
      percentage = (typeAgg[0].count / totalTypes) * 100;
    }

    // 6. Number of high urgency incidents (all time)
    const highUrgencyIncidents = await Incident.countDocuments({
      severity: { $in: ["high", "critical"] },
      created_at: { $gte: startOfMonth, $lte: now },
    });

    const incidentsChangeTendency = incidentsThisMonth - incidentsLastMonth
    const resolutionTimeChangeTendency = averageResolutionTime - averageResolutionTimePreviousMonth

    function findChangePercentile(incidentsThisMonth: number, incidentsLastMonth: number): number {
      // Calculate the absolute change
      const change = incidentsThisMonth - incidentsLastMonth;

      // Case 1: Both values are zero. No change occurred.
      if (incidentsThisMonth === 0 && incidentsLastMonth === 0) {
          return 0;
      }
      // Case 2: Previous value was zero, new value is not. 
      // Growth is infinite from a mathematical perspective, but we must represent it meaningfully.
      else if (incidentsLastMonth === 0 && incidentsThisMonth !== 0) {
        // Return a large positive percent (e.g., 100) to indicate a new issue appeared.
        // Alternatively, some return `Infinity` or `null`, but 100 is a safe numerical value for displays.
        return 100;
      }
      // Case 3: New value is zero, but previous value was not. 
      // This is a complete decrease (to zero).
      else if (incidentsThisMonth === 0 && incidentsLastMonth !== 0) {
        // This is a -100% change. Returning -100 is the most accurate.
        return -100;
      }
      // Case 4: Standard case. Use the formula.
      else {
          return (change / Math.abs(incidentsLastMonth)) * 100;
      }
    }

    return NextResponse.json({
      incidentsThisMonth,
      incidentsLastMonth,
      incidentsChangeTendency,
      incidentsChangePercentile : findChangePercentile(incidentsThisMonth,incidentsLastMonth),
      averageResolutionTime: Number(averageResolutionTime.toFixed(2)),
      averageResolutionTimePreviousMonth: Number(averageResolutionTimePreviousMonth.toFixed(2)),
      resolutionTimeChangeTendency,
      mostCommonIncidentType: mostCommonType,
      mostCommonIncidentPercentage: Number(percentage.toFixed(2)),
      highUrgencyIncidents,
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}
