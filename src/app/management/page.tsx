'use client';
import { useState,useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from "@/components/footerComponent";
import { fetchData } from '@/lib/functions';
import { timeSince } from '@/lib/functions';
import { alertService } from '@/lib/alert.service';
import { useForm } from "react-hook-form";

enum IncidentType {
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  NETWORK = 'network',
  SECURITY = 'security',
  OTHER = 'other'
}

enum ResolutionStrategyType {
  WORKAROUND = 'workaround',
  LONG_TERM_SOLUTION = 'long_term_solution',
  TEMPORARY_FIX = 'temporary_fix',
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

// Enums
enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

enum AdminRole {
  SUPERADMIN = 'superadmin',
  DEPARTMENT_ADMIN = 'incident_manager',
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

export default function IncidentManagement() {
    
  const [isFilterDisplayed,setIsFilterDisplayed] = useState<boolean>(false)
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pendingIncidents,setPendingIncidents] = useState<Incident[]>([]);
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [refreshCount,setRefreshCount] = useState<number>(0);
  const { register, handleSubmit, watch, reset, setValue , formState: { errors, isValid }} = useForm<IncidentUpdateFormProps>();
  const status = watch("status");
  const [aiSuggested,setAiSuggested] = useState<boolean>(false);

  const [filters, setFilters] = useState({
    status: '',
    urgency: '',
    type: '',
    startDate: '',
    endDate: '',
    searchQuery: ''
  });

  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [incidentDetail,setIncidentDetail] = useState<Incident | null>(null);

  async function updateIncident(){
    setIsLoading(true)
    setIncidentDetail(null)
    try{
      const response = await fetch('/api/incidents', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({_id:incidentDetail?._id}),
      })
      if (!response.ok) {
        alertService.error("Failed to update administrator");
        return;
      }
      alertService.success('Successfully edited')
      setRefreshCount(()=>(refreshCount + 1))
    }catch(error){
      console.log(error)
      alertService.error('failed to update incident! Please try again later')
    }finally{
      setIsLoading(false)
    }
  }

  async function fetchIncidents(role:string,admin_id: string|null){
    let data
    if(role === 'superadmin'){
        data = await fetchData(`/api/incidents/admin?count=false`,setIsLoading);
    }else{
        data = await fetchData(`/api/incidents?adminId=${admin_id}&count=false`,setIsLoading);
    }
    setIncidents(data)
  }

  async function fetchPendingIncidents(role:string,admin_id: string|null){
    let data
    if(role === 'superadmin'){
        data = await fetchData(`/api/incidents/admin/pending?count=false`,setIsLoading);
    }else{
        data = await fetchData(`/api/incidents/pending?adminId=${admin_id}&count=false`,setIsLoading);
    }
    setPendingIncidents(data)
  }
  
  useEffect(()=>{
      const adminData = localStorage.getItem('admin_user');
      const connectedAdmin : IAdmin = adminData ? JSON.parse(adminData) : null;
      fetchIncidents(connectedAdmin.role,connectedAdmin._id)
      fetchPendingIncidents(connectedAdmin.role,connectedAdmin._id)
  },[refreshCount])

  const onSubmit = async (data : IncidentUpdateFormProps) => {
    const adminData = localStorage.getItem('admin_user');
    const connectedAdmin : IAdmin = adminData ? JSON.parse(adminData) : null;
    setIsLoading(true);
    setEditingIncident(null);
    try {
      const res = await fetch(`/api/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data,incident_id:editingIncident?._id,admin_id:connectedAdmin._id}),
      });

      if (!res.ok) throw new Error("Failed to update incident");
      alertService.success('Successfully Updated Incident');
      setRefreshCount(()=>(refreshCount + 1))
      reset();
    } catch (err) {
      console.error(err);
      alertService.error('Failed to update Incident')
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#EAF6FF]">
        <Navbar />
        {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-t-[#2A2A72] border-r-[#2A2A72] border-b-transparent border-l-transparent"></div>
            </div>
        )}
        <main className="container mx-auto p-4">
          <h1 className="text-2xl font-bold text-[#232528] my-6">Incident Management</h1>
          {/* Filters Section */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-[#EAF6FF]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#232528]">Filter Incidents</h2>
              <button 
                onClick={() => setIsFilterDisplayed(!isFilterDisplayed)}
                className="text-sm text-[#232528] hover:text-[#FFA400] focus:outline-none cursor-pointer"
              >
                {isFilterDisplayed ? (
                  <span className="flex items-center">
                    Hide filter
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </span>
                ) :(
                  <span className="flex items-center">
                    Show filter
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </button>
            </div>

            {isFilterDisplayed && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[#232528] mb-1">Statut</label>
                    <select 
                      className="w-full p-2 border border-[#EAF6FF] rounded"
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value as IncidentResolutionStatus})}
                    >
                      <option value="">Tous</option>
                      <option value="En attente">En attente</option>
                      <option value="En cours">En cours</option>
                      <option value="Résolu">Résolu</option>
                      <option value="Rejeté">Rejeté</option>
                    </select>
                  </div>

                  {/* Urgency Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[#232528] mb-1">Urgence</label>
                    <select 
                      className="w-full p-2 border border-[#EAF6FF] rounded"
                      value={filters.urgency}
                      onChange={(e) => setFilters({...filters, urgency: e.target.value as IncidentSeverity})}
                    >
                      <option value="">Tous</option>
                      <option value="Faible">Faible</option>
                      <option value="Modéré">Modéré</option>
                      <option value="Élevé">Élevé</option>
                      <option value="Critique">Critique</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[#232528] mb-1">Type</label>
                    <select 
                      className="w-full p-2 border border-[#EAF6FF] rounded"
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value as IncidentType})}
                    >
                      <option value="">Tous</option>
                      <option value="Matériel">Matériel</option>
                      <option value="Applicatifs">Applicatifs</option>
                      <option value="Réseau">Réseau</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-[#232528] mb-1">Recherche</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-[#EAF6FF] rounded"
                      placeholder="Rechercher..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                    />
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-[#232528] mb-1">Date de début</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-[#EAF6FF] rounded"
                      value={filters.startDate}
                      onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#232528] mb-1">Date de fin</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-[#EAF6FF] rounded"
                      value={filters.endDate}
                      onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Aside Table */}
          <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Recent Incidents Panel (Left) */}
            <div className="w-full md:flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer">
              <div className="p-5 border-b border-gray-100 bg-[#EAF6FF]">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Incidents</h2>
                  <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-600 rounded-full">
                    {incidents.length} new
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                {incidents.length > 0?
                <ul className="space-y-3">
                  {incidents.map((i) => (
                    <li key={i._id} className="p-3 hover:bg-gray-50 rounded-lg transition-colors" onClick={()=>{setIncidentDetail(i)}}>
                      <div className="flex gap-3">
                        {/* Severity Indicator */}
                        <div className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-full ${
                          i.severity === IncidentSeverity.CRITICAL ? 'bg-red-500' :
                          i.severity === IncidentSeverity.HIGH ? 'bg-orange-500' :
                          i.severity === IncidentSeverity.MEDIUM ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                              i.severity === IncidentSeverity.CRITICAL ? 'bg-red-100 text-red-800' :
                              i.severity === IncidentSeverity.HIGH ? 'bg-orange-100 text-orange-800' :
                              i.severity === IncidentSeverity.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {i.severity.toLowerCase()}
                            </span>
                            <span className="text-xs text-gray-500 truncate">
                              {timeSince(new Date(i.created_at))}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-2">
                            {i.description}
                          </p>
                          <div className="flex items-center mt-1.5">
                            <span className="text-xs text-gray-500">
                              {i.building_name} - Floor {i.floor_number} - Room {i.room_number}
                            </span>
                          </div>
                          <div className="flex items-center mt-1.5">
                            <span className="text-xs text-gray-500">
                              Reported by {i.reporter_full_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                :<div className='text-center text-sm text-gray-900'>
                  <span>No incident</span>
                  </div>}
              </div>
            </div>

            {/* Incidents Table (Right) - Keeping your existing table styling */}
            <div className="w-full md:flex-[2] bg-white rounded-lg shadow overflow-hidden border border-[#EAF6FF]">
              <div className="bg-white rounded-lg shadow-sm border border-[#EAF6FF] overflow-hidden">
                <div className="bg-[#2A2A72] bg-opacity-50 px-6 py-3 border-b border-[#EAF6FF]">
                    <h2 className="text-lg font-semibold text-[#EAF6FF]">
                        Pending Incidents
                    </h2>
                </div>
                <div className="overflow-x-auto rounded-none">
                  <table className="min-w-full divide-y divide-[#EAF6FF] rounded-none">
                    <thead className="bg-[#EAF6FF] bg-opacity-30">
                      <tr className='rounded-none'>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Reported</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    {pendingIncidents.length === 0 && <tbody className="bg-white divide-y divide-[#EAF6FF]">
                        <tr><td className="px-6 py-4 whitespace-normal break-words text-sm font-medium text-[#232528]">No Incident</td></tr>
                      </tbody>}
                    <tbody className="bg-white divide-y divide-[#EAF6FF]">
                      {pendingIncidents.map((incident) => (
                        <tr key={incident._id} className="hover:bg-[#EAF6FF] hover:bg-opacity-30">
                          <td className="px-6 py-4 whitespace-normal break-words text-sm font-medium text-[#232528]">
                            {incident.description}
                          </td>
                          <td className="px-6 py-4 whitespace-normal break-words text-xs font-normal text-[#232528]">
                            {incident.department.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232528]">
                            {incident.building_name} - Floor {incident.floor_number} - Room {incident.room_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${incident.severity === IncidentSeverity.CRITICAL ? 'bg-red-100 text-red-800' : 
                                    incident.severity === IncidentSeverity.HIGH ? 'bg-orange-100 text-orange-800' : 
                                    incident.severity === IncidentSeverity.MEDIUM ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-blue-100 text-blue-800'}`}>
                              {incident.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {timeSince(new Date(incident.created_at))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex justify-start space-x-2">
                                  <button type="button" onClick={() => setEditingIncident({...incident})} 
                                    className="px-4 py-2 bg-[#2A2A72] text-white cursor-pointer rounded hover:bg-[#3A3A82] transition-colors"
                                  >
                                    Edit
                                  </button>
                              </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* viewing recent incident detail */}
          {incidentDetail && (
          <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl border border-[#EAF6FF]">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#232528]">Incident Details</h2>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs text-gray-500">
                      #{incidentDetail.incident_id}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      incidentDetail.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      incidentDetail.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      incidentDetail.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {incidentDetail.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      incidentDetail.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      incidentDetail.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      incidentDetail.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {incidentDetail.severity}
                    </span>
                  </div>
                </div>
                <button onClick={() => setIncidentDetail(null)} className="text-gray-400 hover:text-[#FFA400] transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                {/* Incident Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-[#232528]">{incidentDetail.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p className="mt-1 text-[#232528]">
                        {incidentDetail.building_name}, Floor {incidentDetail.floor_number}, Room {incidentDetail.room_number}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Reporter</h3>
                      <p className="mt-1 text-[#232528]">
                        {incidentDetail.reporter_full_name}
                        {incidentDetail.reporter_contact && (
                          <span className="block text-sm text-gray-500 mt-1">
                            {incidentDetail.reporter_contact}
                          </span>
                        )}
                        <span className="block text-sm text-gray-500">
                          {incidentDetail.reporter_email}
                        </span>
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-[#232528]">
                          Reported: {new Date(incidentDetail.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-[#232528]">
                          Last Updated: {new Date(incidentDetail.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Update Section */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-[#232528] mb-4">Incident Management</h3>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#EAF6FF] p-4 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm text-[#232528]">
                        Click button to take responsibility for resolving this incident
                      </p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 text-[#232528] cursor-pointer rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    onClick={updateIncident}
                    >
                      Here
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Edit Incident Modal */}
          {editingIncident && (
          <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl border border-[#EAF6FF]">
              <div className="flex justify-between items-start mb-4">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Resolve Incident
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {editingIncident.description}
                    </p>
                  </div>
                  <button onClick={() => setEditingIncident(null)} className="text-[#232528] hover:text-[#FFA400] cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
              </div>
              <form onSubmit={handleSubmit(async FD => onSubmit(FD))} className="space-y-4 p-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">Incident Status</label>
                  <select
                    {...register("status", { required: true })}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Resolution Fields (only if Resolved) */}
                {status === "resolved" && (
                  <>
                    {/* AI Suggest Button */}
                    <div className="flex justify-start mb-2">
                      <button onClick={()=>{
                          setValue("incident_type", IncidentType.OTHER,{ shouldValidate: true, shouldDirty: true });
                          setValue("resolution_strategy_type", ResolutionStrategyType.LONG_TERM_SOLUTION,{ shouldValidate: true, shouldDirty: true });
                          setValue("diagnosis", 'Tentative test diagnosis',{ shouldValidate: true, shouldDirty: true });
                          setValue("measure", 'Tentative measure',{ shouldValidate: true, shouldDirty: true });
                          setValue("recommendation", 'Tentative recommendation',{ shouldValidate: true, shouldDirty: true });
                          setAiSuggested(true);
                        }} type="button"
                        className="px-3 py-1.5 cursor-pointer text-sm font-medium rounded-md bg-[#FFA400] text-white hover:bg-[#e69500] transition"
                      >
                        ✨ {aiSuggested ? "Suggest another solution" : "Let AI Suggest"}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Incident Type</label>
                      <select {...register("incident_type", { required: true })} className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none">
                        <option value="">Select Incident Type</option>
                        <option value="software">Software</option>
                        <option value="hardware">Hardware</option>
                        <option value="network">Network</option>
                        <option value="security">Security</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.incident_type && <p className="text-red-500 text-xs mt-1">{errors.incident_type.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Resolution Strategy</label>
                      <select {...register("resolution_strategy_type",{required: true})}
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                      >
                        <option value="">Select Resolution Strategy</option>
                        <option value="immediate_fix">Immediate Fix</option>
                        <option value="workaround">Workaround</option>
                        <option value="long_term_solution">Long Term Solution</option>
                      </select>
                      {errors.resolution_strategy_type && <p className='text-red-500 text-xs mt-1'>{errors.resolution_strategy_type.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Diagnosis</label>
                      <textarea
                        {...register("diagnosis")}
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                        rows={3}
                      />
                      {errors.diagnosis && <p className='text-red-500 text-xs mt-1'>{errors.diagnosis.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Measures Taken</label>
                      <textarea
                        {...register("measure",{required : true})}
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                        rows={2}
                      />
                      {errors.measure && <p className='text-red-500 text-xs mt-1'>{errors.measure.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Recommendation (optional)</label>
                      <textarea
                        {...register("recommendation")}
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                        rows={2}
                      />
                    </div>
                  </>
                )}

                {/* Submit */}
                {isValid?(
                  <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-md bg-[#2A2A72] text-white py-2 hover:bg-[#2A2A72]/90 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? "Updating..." : "Update Incident"}
                </button>
                ):(
                  <button
                  type="submit"
                  disabled={true}
                  className="w-full rounded-md bg-gray-300 text-gray-500 py-2  cursor-disabled"
                >
                  {isLoading ? "Updating..." : "Update Incident"}
                </button>
                )}
                
              </form>
            </div>
          </div>
          )}
        </main>
      </div>
      <Footer />
    </>
)};