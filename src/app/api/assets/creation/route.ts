import { NextResponse } from 'next/server'
import { connectDatabase } from '@/lib/connect'
import { Asset, AssetState, AssetStateHistory,AssetMaintenance } from '@/lib/models' // adjust import path
import { Types } from 'mongoose'
import mongoose from 'mongoose';


/**
 * @typedef {Object} AssetResponse
 * @property {string} _id - Asset unique identifier
 * @property {string} asset_id - Human-readable asset ID
 * @property {string} model_number - Model number of the asset
 * @property {string} state - Current state of the asset
 * @property {Date} date_in_production - When asset went into production
 * @property {number} lifespan - Expected lifespan in months
 * @property {number} maintenance_frequency - Maintenance frequency in months
 * @property {string} criticality - Asset criticality level
 * @property {string} asset_type - Type of asset
 * @property {Object} [location] - Location details (only for in_use, under_maintenance, has_issues states)
 * @property {string} location.room_number - Room number where asset is located
 * @property {number} location.floor - Floor number
 * @property {string} location.building - Building name
 * @property {string} location.department - Department name
 */

/**
 * @typedef {Object} CreateAssetRequest
 * @property {string} type - Asset type ID (required)
 * @property {string} model_number - Model number (required)
 * @property {number} lifespan - Lifespan in months (required)
 * @property {number} maintenance_frequency - Maintenance frequency in months (required)
 * @property {string} state - Initial state (required)
 * @property {string} [office_id] - Office location ID
 * @property {string} [criticality] - Criticality level
 * @property {string} [date_in_production] - Production start date
 * @property {string} [changed_by] - Admin ID who created the asset
 * @property {string} [notes] - Additional notes
 */

/**
 * GET /api/assets
 * @description Fetches all assets with complete details including type, location, and department information
 * @returns {Promise<NextResponse>} JSON response containing array of assets or error message
 * @throws {500} When database operation fails
 * @example
 * // Response format
 * [
 *   {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "asset_id": "AST-0001",
 *     "model_number": "MOD-123",
 *     "state": "in_use",
 *     "asset_type": "Laptop",
 *     "location": {
 *       "room_number": "101",
 *       "floor": 1,
 *       "building": "Main Building",
 *       "department": "Engineering"
 *     }
 *   }
 * ]
 */
export async function GET() {
  try {
    await connectDatabase();
    // Step 1 — Aggregate base asset info with joins
    const assets = await Asset.aggregate([
      {
        $lookup: {
          from: 'assettypes',
          localField: 'type_id',
          foreignField: '_id',
          as: 'assetTypeInfo',
        },
      },
      { $unwind: { path: '$assetTypeInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'rooms',
          localField: 'office_id',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      { $unwind: { path: '$roomInfo', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'departments',
          localField: 'roomInfo.department_id',
          foreignField: '_id',
          as: 'departmentInfo',
        },
      },
      { $unwind: { path: '$departmentInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          asset_id: 1,
          model_number: 1,
          state: 1,
          date_in_production: 1,
          lifespan: 1,
          maintenance_frequency: 1,
          criticality: 1,
          asset_type: '$assetTypeInfo.name',
          location: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$state', 'in_use'] },
                  { $eq: ['$state', 'under_maintenance'] },
                  { $eq: ['$state', 'has_issues'] },
                ],
              },
              then: {
                room_number: '$roomInfo.room_number',
                floor: '$roomInfo.floor_number',
                building: '$roomInfo.building_name',
                department: '$departmentInfo.name',
              },
              else: '$$REMOVE',
            },
          },
        },
      },
    ]);

    // Step 2 — Post-process: compute nextRoutineMaintenanceDate
    const enhancedAssets = await Promise.all(
      assets.map(async (asset) => {
        let nextRoutineMaintenanceDate: number | Date | null = NaN;

        switch (asset.state) {
          case AssetState.HAS_ISSUES:
            nextRoutineMaintenanceDate = 0;
            break;

          case AssetState.IN_STOCK:
          case AssetState.RETIRED:
            nextRoutineMaintenanceDate = NaN;
            break;

          case AssetState.IN_USE:
          case AssetState.UNDER_MAINTENANCE: {
            // Find last maintenance record
            const lastMaintenance = await AssetMaintenance.findOne({
              asset_id: asset._id,
            }).sort({ performed_at: -1 });

            const baseDate =
              lastMaintenance?.performed_at || asset.date_in_production;

            if (baseDate) {
              const date = new Date(baseDate);
              date.setMonth(
                date.getMonth() + (asset.maintenance_frequency || 0)
              );
              nextRoutineMaintenanceDate = date;
            } else {
              nextRoutineMaintenanceDate = NaN;
            }
            break;
          }

          default:
            nextRoutineMaintenanceDate = NaN;
        }

        return {
          ...asset,
          nextRoutineMaintenanceDate,
        };
      })
    );

    // Step 3 — Divide and conquer sorting
    const groupA = enhancedAssets.filter(a => a.state === AssetState.HAS_ISSUES);
    const groupB = enhancedAssets.filter(
      a => a.state === AssetState.IN_USE || a.state === AssetState.UNDER_MAINTENANCE
    );
    const groupC = enhancedAssets.filter(
      a => a.state === AssetState.IN_STOCK || a.state === AssetState.RETIRED
    );

    // Group A — sort by criticality (high > medium > low)
    const criticalityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    groupA.sort((a, b) => {
      const valA = criticalityOrder[a.criticality ?? ''] || 0;
      const valB = criticalityOrder[b.criticality ?? ''] || 0;
      return valB - valA; // high first
    });

    // Group B — sort by decreasing nextRoutineMaintenanceDate
    groupB.sort((a, b) => {
      const dateA = new Date(a.nextRoutineMaintenanceDate).getTime();
      const dateB = new Date(b.nextRoutineMaintenanceDate).getTime();
      return dateA - dateB;
    });

    // Group C — no sorting

    // Merge the groups in required order
    const sortedAssets = [...groupA, ...groupB, ...groupC];

    return NextResponse.json(sortedAssets, { status: 200 });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { message: "Failed to fetch assets"},
      { status: 500 }
    );
  }
}

/**
 * POST /api/assets
 * @description Creates a new asset with automatic asset_id generation and optional state history tracking
 * @param {Request} req - The request object containing asset data
 * @body {CreateAssetRequest} - Asset creation data
 * @returns {Promise<NextResponse>} JSON response with created asset or error message
 * @throws {400} When required fields are missing
 * @throws {500} When database operation fails
 * @example
 * // Request body
 * {
 *   "type": "507f1f77bcf86cd799439011",
 *   "model_number": "MOD-123",
 *   "lifespan": 60,
 *   "maintenance_frequency": 6,
 *   "state": "in_use",
 *   "office_id": "507f1f77bcf86cd799439012",
 *   "criticality": "high",
 *   "changed_by": "507f1f77bcf86cd799439013"
 * }
 */
export async function POST(req: Request) {
  try {
    await connectDatabase()
    const body = await req.json()

    const {
      type, 
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

/**
 * PATCH /api/assets
 * @description Fetches assets filtered by admin's department access. Only returns assets from departments the admin manages.
 * @param {Request} req - The request object containing admin ID
 * @body {Object} - Request body
 * @body {string} adminId - Admin ID to filter assets by department access (required)
 * @returns {Promise<NextResponse>} JSON response containing filtered assets or error message
 * @throws {400} When adminId is missing or invalid
 * @throws {500} When database operation fails
 * @example
 * // Request body
 * {
 *   "adminId": "507f1f77bcf86cd799439013"
 * }
 */
export async function PATCH(req: Request){
  const body = await req.json()
  const {adminId} = body

  if (!adminId) {
    return NextResponse.json(
      { message: 'Error: Missing admin ID.' },
      { status: 400 }
    );
  }

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    return NextResponse.json(
      { message: 'Error: Invalid admin ID format.' },
      { status: 400 }
    );
  }
  
  try {
    await connectDatabase();

    const assets = await Asset.aggregate([
      // Stage 1: Join with AssetType collection
      {
        $lookup: {
          from: 'assettypes',
          localField: 'type_id',
          foreignField: '_id',
          as: 'assetTypeInfo',
        },
      },
      // Stage 2: Deconstruct the array to an object
      {
        $unwind: {
          path: '$assetTypeInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 3: Join with Room (office)
      {
        $lookup: {
          from: 'rooms',
          localField: 'office_id',
          foreignField: '_id',
          as: 'roomInfo',
        },
      },
      // Stage 4: Deconstruct roomInfo array
      {
        $unwind: {
          path: '$roomInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 5: Join with Department
      {
        $lookup: {
          from: 'departments',
          localField: 'roomInfo.department_id',
          foreignField: '_id',
          as: 'departmentInfo',
        },
      },
      // Stage 6: Deconstruct departmentInfo array
      {
        $unwind: {
          path: '$departmentInfo',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 7: Join with AdminDepartment to check admin association
      {
        $lookup: {
          from: 'admindepartments',
          localField: 'departmentInfo._id',
          foreignField: 'department_id',
          as: 'adminDepartments',
        },
      },
      // Stage 8: Filter only departments linked to this admin
      {
        $match: {
          'adminDepartments.admin_id': new mongoose.Types.ObjectId(adminId),
        },
      },
      // Stage 9: Project and shape the final output
      {
        $project: {
          _id: 1,
          asset_id: 1,
          model_number: 1,
          state: 1,
          date_in_production: 1,
          lifespan: 1,
          maintenance_frequency: 1,
          criticality: 1,
          asset_type: '$assetTypeInfo.name',
          location: {
            $cond: {
              if: {
                $or: [
                  { $eq: ['$state', 'in_use'] },
                  { $eq: ['$state', 'under_maintenance'] },
                  { $eq: ['$state', 'has_issues'] },
                ],
              },
              then: {
                room_number: '$roomInfo.room_number',
                floor: '$roomInfo.floor_number',
                building: '$roomInfo.building_name',
                department: '$departmentInfo.name',
              },
              else: '$$REMOVE',
            },
          },
        },
      },
    ]);

    const enhancedAssets = await Promise.all(
      assets.map(async (asset) => {
        let nextRoutineMaintenanceDate: number | Date | null = NaN;

        switch (asset.state) {
          case AssetState.HAS_ISSUES:
            nextRoutineMaintenanceDate = 0;
            break;

          case AssetState.IN_STOCK:
          case AssetState.RETIRED:
            nextRoutineMaintenanceDate = NaN;
            break;

          case AssetState.IN_USE:
          case AssetState.UNDER_MAINTENANCE: {
            // Find last maintenance record
            const lastMaintenance = await AssetMaintenance.findOne({
              asset_id: asset._id,
            }).sort({ performed_at: -1 });

            const baseDate =
              lastMaintenance?.performed_at || asset.date_in_production;

            if (baseDate) {
              const date = new Date(baseDate);
              date.setMonth(
                date.getMonth() + (asset.maintenance_frequency || 0)
              );
              nextRoutineMaintenanceDate = date;
            } else {
              nextRoutineMaintenanceDate = NaN;
            }
            break;
          }

          default:
            nextRoutineMaintenanceDate = NaN;
        }

        return {
          ...asset,
          nextRoutineMaintenanceDate,
        };
      })
    );

    // Step 3 — Divide and conquer sorting
    const groupA = enhancedAssets.filter(a => a.state === AssetState.HAS_ISSUES);
    const groupB = enhancedAssets.filter(
      a => a.state === AssetState.IN_USE || a.state === AssetState.UNDER_MAINTENANCE
    );
    const groupC = enhancedAssets.filter(
      a => a.state === AssetState.IN_STOCK || a.state === AssetState.RETIRED
    );

    // Group A — sort by criticality (high > medium > low)
    const criticalityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
    groupA.sort((a, b) => {
      const valA = criticalityOrder[a.criticality ?? ''] || 0;
      const valB = criticalityOrder[b.criticality ?? ''] || 0;
      return valB - valA; // high first
    });

    // Group B — sort by decreasing nextRoutineMaintenanceDate
    groupB.sort((a, b) => {
      const dateA = new Date(a.nextRoutineMaintenanceDate).getTime();
      const dateB = new Date(b.nextRoutineMaintenanceDate).getTime();
      return dateA - dateB;
    });

    // Group C — no sorting

    // Merge the groups in required order
    const sortedAssets = [...groupA, ...groupB, ...groupC];

    return NextResponse.json(sortedAssets, { status: 200 });
  } catch (error) {
    console.error('Error fetching assets by admin:', error);
    return NextResponse.json(
      { message: 'Failed to fetch assets' },
      { status: 500 }
    );
  }
}

