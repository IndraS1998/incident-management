interface AssetModalProps{
    asset: AssetDataType | null;
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleRefresh : () => void;
}
/**
 * @maintenance modal data types
 */
export enum AssetState {
  IN_STOCK = 'in_stock',
  IN_USE = 'in_use',
  RETIRED = 'retired',
  HAS_ISSUES = 'has_issues',
  UNDER_MAINTENANCE = 'under_maintenance',
}
interface LocationDataType {
  building: string;
  department: string;
  floor: number;
  room_number: number;
}

interface AssetDataType {
  _id: string;
  asset_id: string;
  asset_type: string;
  criticality: string;
  model_number: string;
  lifespan: number;
  location: LocationDataType | null;
  state: AssetState;
  age: string;
  maintenance_frequency: number;
  date_in_production: string;
}

export enum MaintenanceType {
  ROUTINE = 'routine',
  REPAIR = 'repair',
  UPGRADE = 'upgrade',
}

interface MaintenanceModalFormProps{
    maintenance_type: MaintenanceType;
    notes: string;
    next_due_date: Date;
}

/**
 * @Asset Movement data
 */
interface MovementModalFormProps{
    department : string;
    building: string;
    floor: number;
    room: string;
    reason: string;
}

interface StateChangeFormProps{
    new_state: AssetState;
    notes: string;
}

export type { AssetModalProps, MaintenanceModalFormProps, AssetDataType, LocationDataType, MovementModalFormProps,StateChangeFormProps }