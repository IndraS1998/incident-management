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

enum IncidentSeverity{
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

const AdminDepartmentSchema = new Schema<IAdminDepartment>({
  admin_id: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  department_id: { type: Schema.Types.ObjectId, ref: 'Department', required: true }
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