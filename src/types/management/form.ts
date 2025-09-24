import { IncidentSeverity,IncidentResolutionStatus,AdminStatus,AdminRole } from "./enums";

interface AIProposalForm{
  incident_type:string;
  resolution_strategy_type:string;
  diagnosis:string;
  measure:string;
  recommendation:string;
}

interface IDepartment{
  department_id: string;
  name: string;
  contact: string;
}

interface Incident{
  _id:string;
  incident_id: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentResolutionStatus;
  reporter_full_name: string;
  reporter_email: string;
  reporter_contact?: string;
  room_id: string;
  room_number:string;
  floor_number:number;
  building_name:string;
  department: IDepartment;
  created_at: Date;
  updated_at: Date;
}

interface IAdmin {
  _id:string;
  admin_id: string; // Unique identifier for the admin composed of first letter of first name and lastname
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  status: AdminStatus;
  role: AdminRole;
}

interface IncidentUpdateFormProps {
  status:string;
  incident_type:string;
  resolution_strategy_type:string;
  diagnosis:string;
  measure:string;
  recommendation:string;
}

interface AcknowledgementProps{
  incident:Incident;
  setIncident:React.Dispatch<React.SetStateAction<Incident | null>>;
  setIsLoading:React.Dispatch<React.SetStateAction<boolean>>;
  setRefreshCount: React.Dispatch<React.SetStateAction<number>>
  refreshCount:number;
  isLoading:boolean;
}

interface ClosureProps{
  incident:Incident;
  setIncident:React.Dispatch<React.SetStateAction<Incident | null>>;
  setIsLoading:React.Dispatch<React.SetStateAction<boolean>>;
  setRefreshCount: React.Dispatch<React.SetStateAction<number>>
  refreshCount:number;
  isLoading:boolean;
}

interface FilterIncidentsProps{
  setIncidents: React.Dispatch<React.SetStateAction<Incident[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}
export type {IncidentUpdateFormProps,IAdmin,Incident,IDepartment,AIProposalForm,AcknowledgementProps,ClosureProps,FilterIncidentsProps}