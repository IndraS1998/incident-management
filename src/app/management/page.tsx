'use client';
import { useState,useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from "@/components/footerComponent";
import { fetchData } from '@/lib/functions';
import { timeSince } from '@/lib/functions';
import { Incident,IAdmin } from '@/types/management/form';
import { IncidentResolutionStatus,IncidentSeverity,IncidentType } from '@/types/management/enums';
import Acknowledgement from '@/components/management/acknowlegement';
import Closure from '@/components/management/closure';
import Pagination from '@/components/Pagination/file';
import PageLoader from '@/components/loaders/pageLoaders';

export default function IncidentManagement() {
    
  const [isFilterDisplayed,setIsFilterDisplayed] = useState<boolean>(false)
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pendingIncidents,setPendingIncidents] = useState<Incident[]>([]);
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [refreshCount,setRefreshCount] = useState<number>(0);
  const [page,setPage] = useState<number>(1)
  const [incidentPage,setIncidentPage] = useState<number>(1)

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

  

  return (
    <>
      <div className="min-h-screen bg-[#EAF6FF]">
        <Navbar />
        {isLoading && (
            <PageLoader />
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
                  {incidents.slice(((incidentPage - 1) * 5),(incidentPage * 5)).map((i) => (
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
              <Pagination currentPage={incidentPage} totalPages={Math.ceil(incidents.length/5)} onPageChange={setIncidentPage}/>
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
                      {pendingIncidents.slice((page - 1) * 5, page * 5).map((incident) => (
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
                  <Pagination  currentPage={page} totalPages={Math.ceil(pendingIncidents.length/5)} onPageChange={setPage}/>
                </div>
              </div>
            </div>
          </div>

          {/* viewing recent incident detail */}
          {incidentDetail && (
            <Acknowledgement incident={incidentDetail} setIncident={setIncidentDetail} isLoading={isLoading} setIsLoading={setIsLoading} setRefreshCount={setRefreshCount} refreshCount={refreshCount} />
          )}

          {/* Edit Incident Modal */}
          {editingIncident && (
            <Closure incident={editingIncident} setIncident={setEditingIncident} isLoading={isLoading} setIsLoading={setIsLoading} setRefreshCount={setRefreshCount} refreshCount={refreshCount} />
          )}
        </main>
      </div>
      <Footer />
    </>
)};