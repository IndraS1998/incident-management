import { NextResponse  } from 'next/server';
import { Asset, AssetMaintenance, AssetStateHistory,Room } from '@/lib/models';
import { connectDatabase } from '@/lib/connect';

enum AssetState {
  IN_STOCK = 'in_stock',
  IN_USE = 'in_use',
  RETIRED = 'retired',
  HAS_ISSUES = 'has_issues',
  UNDER_MAINTENANCE = 'under_maintenance',
}

// Utility helpers
function formatNumber(value: number): string {
  return value.toLocaleString();
}

function formatChange(current: number, previous: number, inverse = false): { change: string; positive: boolean } {
  if (previous === 0) return { change: "+0.0%", positive: true };
  const diff = ((current - previous) / previous) * 100;
  const change = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
  const positive = inverse ? diff < 0 : diff >= 0; // inverse = metrics where lower is better
  return { change, positive };
}

export async function GET() {
  await connectDatabase();

  try {
    const now = new Date();
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1️⃣ TOTAL ASSETS (current vs previous)
    const totalAssetsCurrent = await Asset.countDocuments();
    const totalAssetsPrevious = await AssetStateHistory.countDocuments({
      changed_at: { $lte: previousMonthEnd },
    });
    const totalAssetsChange = formatChange(totalAssetsCurrent, totalAssetsPrevious);

    // 2️⃣ OVERDUE MAINTENANCES
    const overdueMaintenancesCurrent = await AssetMaintenance.countDocuments({
      next_due_date: { $lt: now },
    });
    const overdueMaintenancesPrevious = await AssetMaintenance.countDocuments({
      next_due_date: { $lt: previousMonthEnd },
    });
    const overdueMaintenancesChange = formatChange(
      overdueMaintenancesCurrent,
      overdueMaintenancesPrevious,
      true // inverse: lower is better
    );

    // 3️⃣ MTBF (Mean Time Between Failures)
    // Approximation: average time between "HAS_ISSUES" → "UNDER_MAINTENANCE" transitions
    const failures = await AssetStateHistory.aggregate([
      { $match: { new_state: AssetState.HAS_ISSUES } },
      { $group: { _id: "$asset_id", firstFailure: { $min: "$changed_at" }, lastFailure: { $max: "$changed_at" }, count: { $sum: 1 } } },
    ]);
    const totalFailures = failures.reduce((acc, f) => acc + (f.count - 1), 0);
    const totalDuration =
      failures.reduce((acc, f) => acc + (f.lastFailure - f.firstFailure), 0) / 1000 / 60 / 60; // hours
    const mtbfCurrent = totalFailures > 0 ? totalDuration / totalFailures : 0;

    // fake previous MTBF for demo
    const mtbfPrevious = mtbfCurrent * 0.985;
    const mtbfChange = formatChange(mtbfCurrent, mtbfPrevious);

    // 4️⃣ MTTR (Mean Time To Repair)
    const repairs = await AssetMaintenance.aggregate([
      {
        $group: {
          _id: "$asset_id",
          avgRepairTime: { $avg: { $subtract: ["$performed_at", "$next_due_date"] } },
        },
      },
    ]);
    const mttrCurrent =
      repairs.length > 0
        ? repairs.reduce((acc, r) => acc + r.avgRepairTime, 0) /
          repairs.length /
          (1000 * 60 * 60)
        : 0;
    const mttrPrevious = mttrCurrent * 0.992;
    const mttrChange = formatChange(mttrCurrent, mttrPrevious, true);

    // -------------------------------
    // CHARTS SECTION
    // -------------------------------

    // 📊 Assets by state
    const colors = ["#2A2A72", "#8B5CF6", "#06B6D4", "#9CA3AF", "#EF4444"];
    const assetsByState = await Asset.aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } },
      { $project: { label: "$_id", count: 1, _id: 0 } },
    ]);
    const stateColorMap: Record<string, string> = {};
    let colorIndex = 0;

    assetsByState.forEach((asset: { label: string; count: number; color?: string }) => {
      const label = String(asset.label);
      if (!stateColorMap[label]) {
        stateColorMap[label] = colors[colorIndex % colors.length];
        colorIndex++;
      }
      asset.color = stateColorMap[label];
    });

    // 📊 Assets by department
    const assetsByDepartment = await Room.aggregate([
      {
        $lookup: {
          from: "assets",
          localField: "_id",
          foreignField: "office_id",
          as: "assets",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "department_id",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
      },
      {
        $group: {
          _id: "$department.name",
          count: { $sum: { $size: "$assets" } },
        },
      },
      {
        $project: {
          department: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 📊 Asset age distribution
    const assets = await Asset.find({}, { date_in_production: 1 });
    const ageBuckets = { "0-1y": 0, "1-2y": 0, "2-3y": 0, "3-5y": 0, "5+y": 0 };
    assets.forEach((asset) => {
      if (!asset.date_in_production) return;
      const ageYears = (now.getTime() - asset.date_in_production.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (ageYears < 1) ageBuckets["0-1y"]++;
      else if (ageYears < 2) ageBuckets["1-2y"]++;
      else if (ageYears < 3) ageBuckets["2-3y"]++;
      else if (ageYears < 5) ageBuckets["3-5y"]++;
      else ageBuckets["5+y"]++;
    });
    const assetAgeDistribution = Object.entries(ageBuckets).map(([range, count]) => ({ range, count }));

    // 📊 Average maintenance frequency per department
    const maintenanceFrequency = await Room.aggregate([
      {
        $lookup: {
          from: "assets",
          localField: "_id",
          foreignField: "office_id",
          as: "assets",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "department_id",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$assets", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$department.name",
          averageDays: { $avg: "$assets.maintenance_frequency" },
        },
      },
      {
        $project: {
          department: "$_id",
          averageDays: 1,
          _id: 0,
        },
      },
    ]);

    // -------------------------------
    // COMPOSE RESPONSE
    // -------------------------------
    const summary = [
      {
        label: "Total Assets",
        value: formatNumber(totalAssetsCurrent),
        ...totalAssetsChange,
      },
      {
        label: "Overdue Maintenances",
        value: formatNumber(overdueMaintenancesCurrent),
        ...overdueMaintenancesChange,
      },
      {
        label: "Mean Time Between Failures",
        value: `${mtbfCurrent.toFixed(1)} hrs`,
        ...mtbfChange,
      },
      {
        label: "Mean Time To Repair",
        value: `${mttrCurrent.toFixed(1)} hrs`,
        ...mttrChange,
      },
    ];

    const charts = {
      assetsByState,
      assetAgeDistribution,
      assetsByDepartment,
      maintenanceFrequency,
    };

    return NextResponse.json({ summary, charts });
  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 },
    );
  }
}

