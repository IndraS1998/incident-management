import { Schema, model, Document, Types,models } from 'mongoose';

// Enums
enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

enum AdminRole {
  SUPERADMIN = 'superadmin',
  DEPARTMENT_ADMIN = 'incident_manager',
}

enum IncidentType {
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  NETWORK = 'network',
  SECURITY = 'security',
  OTHER = 'other'
}

enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum IncidentResolutionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

enum ResolutionStrategyType {
  IMMEDIATE_FIX = 'immediate_fix',
  WORKAROUND = 'workaround',
  LONG_TERM_SOLUTION = 'long_term_solution'
}

// Enums
enum AssetState {
  IN_STOCK = 'in_stock',
  IN_USE = 'in_use',
  RETIRED = 'retired',
  HAS_ISSUES = 'has_issues',
  UNDER_MAINTENANCE = 'under_maintenance',
}

enum MaintenanceType {
  ROUTINE = 'routine',
  REPAIR = 'repair',
  UPGRADE = 'upgrade',
}

// Interfaces
interface IAdmin extends Document {
  admin_id: string; // Unique identifier for the admin composed of first letter of first name and lastname
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  status: AdminStatus;
  role: AdminRole;
}

interface IDepartment extends Document {
  department_id: string;
  name: string;
  contact: string;
}

interface IBuilding extends Document {
  building_name: string;
}

interface IFloor extends Document {
  floor_number: number;
  building_name: string;
}

export interface IRoom extends Document {
  room_number: string;
  floor_number: number;
  building_name: string;
  department_id?: Types.ObjectId | IDepartment;
}

export interface IIncident extends Document {
  incident_id: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentResolutionStatus;
  reporter_full_name: string;
  reporter_email: string;
  reporter_contact?: string;
  room_id: Types.ObjectId | IRoom;
  created_at?: Date;
  updated_at?: Date;
}

interface IAIResolutionProposal extends Document{
  proposal_id: string;
  incident_id: Types.ObjectId | IIncident;
  admin_id: Types.ObjectId | IAdmin;
  incident_type?: IncidentType;
  diagnosis: string;
  resolution_strategy_type: ResolutionStrategyType;
  measure: string;
  recommendation?: string;
}

interface IIncidentResolution extends Document {
  resolution_id: string;
  incident_id: Types.ObjectId | IIncident;
  admin_id: Types.ObjectId | IAdmin;
  resolution_time: Date;
  incident_type?: IncidentType;
  diagnosis: string;
  resolution_strategy_type: ResolutionStrategyType;
  measure: string;
  recommendation?: string;
}

interface IAdminDepartment extends Document {
  admin_id: Types.ObjectId | IAdmin;
  department_id: Types.ObjectId | IDepartment;
}

export interface IAssetType extends Document {
  name: string;
}

export interface IAsset extends Document {
  asset_id: string;
  type_id: Types.ObjectId | IAssetType;
  model_number: string;
  state: AssetState;
  date_in_production: Date;
  lifespan: number; // in months or years
  maintenance_frequency: number; // e.g. in days
  office_id: Types.ObjectId; // references Office
  age?: number; // derived field
}

export interface IAssetMovement extends Document {
  movement_id: string;
  asset_id: Types.ObjectId | IAsset;
  from_office_id?: Types.ObjectId; // nullable if first assignment
  to_office_id: Types.ObjectId;
  moved_at: Date;
  moved_by: Types.ObjectId; // admin
  reason?: string;
}

export interface IAssetStateHistory extends Document {
  history_id: string;
  asset_id: Types.ObjectId | IAsset;
  previous_state: AssetState;
  new_state: AssetState;
  changed_at: Date;
  changed_by: Types.ObjectId; // admin
  notes?: string;
}

export interface IAssetMaintenance extends Document {
  maintenance_id: string;
  asset_id: Types.ObjectId | IAsset;
  performed_at: Date;
  performed_by: Types.ObjectId; // admin
  maintenance_type: MaintenanceType;
  notes?: string;
  next_due_date?: Date;
}

// Schemas
const AdminSchema = new Schema<IAdmin>({
  admin_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password_hash: { type: String, required: true },
  status: { type: String, enum: Object.values(AdminStatus), required: true },
  role: { type: String, enum: Object.values(AdminRole), required: true },
});

const DepartmentSchema = new Schema<IDepartment>({
  department_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contact: { type: String, required: true }
});

const BuildingSchema = new Schema<IBuilding>({
  building_name: { type: String, required: true, unique: true }
});

const FloorSchema = new Schema<IFloor>({
  floor_number: { type: Number, required: true },
  building_name: { type: String, required: true }
});

FloorSchema.index({ floor_number: 1, building_name: 1 }, { unique: true });

const RoomSchema = new Schema<IRoom>({
  room_number: { type: String, required: true },
  floor_number: { type: Number, required: true },
  building_name: { type: String, required: true },
  department_id: { type: Schema.Types.ObjectId, ref: 'Department' }
});

RoomSchema.index({ room_number: 1, floor_number: 1, building_name: 1 }, { unique: true });

const IncidentSchema = new Schema<IIncident>({
  incident_id: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  severity: { type: String, required: true },
  status: { type: String, required: true },
  reporter_full_name: { type: String, required: true },
  reporter_email: { type: String, required: true },
  reporter_contact: { type: String },
  room_id: { type: Schema.Types.ObjectId, ref: 'Room', required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const IncidentResolutionSchema = new Schema<IIncidentResolution>({
  resolution_id: { type: String, required: true, unique: true },
  incident_id: { type: Schema.Types.ObjectId, ref: 'Incident', required: true },
  admin_id: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  resolution_time: { type: Date, required: true },
  incident_type: { type: String, enum: Object.values(IncidentType) },
  diagnosis: { type: String },
  resolution_strategy_type: { type: String, enum: Object.values(ResolutionStrategyType) },
  measure: { type: String },
  recommendation: { type: String }
});

const AIResolutionProposalSchema = new Schema<IAIResolutionProposal>({
  proposal_id: { type: String, required: true, unique: true },
  incident_id: { type: Schema.Types.ObjectId, ref: 'Incident', required: true },
  admin_id: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  incident_type: { type: String, enum: Object.values(IncidentType) },
  diagnosis: { type: String },
  resolution_strategy_type: { type: String, enum: Object.values(ResolutionStrategyType) },
  measure: { type: String },
  recommendation: { type: String }
})

const AdminDepartmentSchema = new Schema<IAdminDepartment>({
  admin_id: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  department_id: { type: Schema.Types.ObjectId, ref: 'Department', required: true }
});

const AssetTypeSchema = new Schema<IAssetType>({
  name: { type: String, required: true, unique: true },
});

const AssetSchema = new Schema<IAsset>({
  asset_id: { type: String, required: true, unique: true },
  type_id: { type: Schema.Types.ObjectId, ref: 'AssetType', required: true },
  model_number: { type: String, required: true },
  state: { type: String, enum: Object.values(AssetState), required: true },
  date_in_production: { type: Date, required: true },
  lifespan: { type: Number, required: true },
  maintenance_frequency: { type: Number, required: true },
  office_id: { type: Schema.Types.ObjectId, ref: 'Office', required: true },
});

// Derived virtual field: asset age
AssetSchema.virtual('age').get(function (this: IAsset) {
  if (!this.date_in_production) return 0;
  const now = new Date();
  const diff = now.getTime() - this.date_in_production.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365)); // in years
});

const AssetMovementSchema = new Schema<IAssetMovement>({
  movement_id: { type: String, required: true, unique: true },
  asset_id: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  from_office_id: { type: Schema.Types.ObjectId, ref: 'Office' },
  to_office_id: { type: Schema.Types.ObjectId, ref: 'Office', required: true },
  moved_at: { type: Date, default: Date.now },
  moved_by: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  reason: { type: String },
});

const AssetStateHistorySchema = new Schema<IAssetStateHistory>({
  history_id: { type: String, required: true, unique: true },
  asset_id: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  previous_state: { type: String, enum: Object.values(AssetState), required: true },
  new_state: { type: String, enum: Object.values(AssetState), required: true },
  changed_at: { type: Date, default: Date.now },
  changed_by: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  notes: { type: String },
});

const AssetMaintenanceSchema = new Schema<IAssetMaintenance>({
  maintenance_id: { type: String, required: true, unique: true },
  asset_id: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  performed_at: { type: Date, default: Date.now },
  performed_by: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  maintenance_type: { type: String, enum: Object.values(MaintenanceType), required: true },
  notes: { type: String },
  next_due_date: { type: Date },
});

AdminDepartmentSchema.index({ admin_id: 1, department_id: 1 }, { unique: true });

// Models
export const Admin = models.Admin || model<IAdmin>('Admin', AdminSchema);
export const Department = models.Department || model<IDepartment>('Department', DepartmentSchema);
export const Building = models.Building || model<IBuilding>('Building', BuildingSchema);
export const Floor = models.Floor || model<IFloor>('Floor', FloorSchema);
export const Room = models.Room || model<IRoom>('Room', RoomSchema);
export const Incident = models.Incident || model<IIncident>('Incident', IncidentSchema);
export const IncidentResolution = models.IncidentResolution || model<IIncidentResolution>('IncidentResolution', IncidentResolutionSchema);
export const AdminDepartment = models.AdminDepartment || model<IAdminDepartment>('AdminDepartment', AdminDepartmentSchema);
export const AIResolutionProposal = models.AIResolutionProposal || model<IAIResolutionProposal>('AIResolutionProposal',AIResolutionProposalSchema)
export const AssetType = models.AssetType || model<IAssetType>('AssetType', AssetTypeSchema);
export const Asset = models.Asset || model<IAsset>('Asset', AssetSchema);
export const AssetMovement = models.AssetMovement || model<IAssetMovement>('AssetMovement', AssetMovementSchema);
export const AssetStateHistory = models.AssetStateHistory || model<IAssetStateHistory>('AssetStateHistory', AssetStateHistorySchema);
export const AssetMaintenance = models.AssetMaintenance || model<IAssetMaintenance>('AssetMaintenance', AssetMaintenanceSchema);