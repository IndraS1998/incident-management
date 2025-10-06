'use client';
import { useState,useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from "@/components/footerComponent";
import { fetchData } from '@/lib/functions';
import { timeSince } from '@/lib/functions';
import { Incident,IAdmin } from '@/types/management/form';
import { IncidentSeverity } from '@/types/management/enums';
import Acknowledgement from '@/components/management/acknowlegement';
import Closure from '@/components/management/closure';
import Pagination from '@/components/Pagination/file';
import PageLoader from '@/components/loaders/pageLoaders';
import FilterIncidents from '@/components/management/filterIncidents';

function sortIncidentBySeverity(incidents:Incident[]): Incident[]{
  const severityMagnitude = {
    [IncidentSeverity.CRITICAL] : 4,
    [IncidentSeverity.HIGH]: 3,
    [IncidentSeverity.MEDIUM]: 2,
    [IncidentSeverity.LOW] : 1,
  }
  return [...incidents].sort((a,b) => {return severityMagnitude[b.severity] - severityMagnitude[a.severity]})
}

export default function IncidentManagement() {
    
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [pendingIncidents,setPendingIncidents] = useState<Incident[]>([]);
  const [isLoading,setIsLoading] = useState<boolean>(false);
  const [refreshCount,setRefreshCount] = useState<number>(0);
  const [page,setPage] = useState<number>(1)
  const [incidentPage,setIncidentPage] = useState<number>(1)
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [incidentDetail,setIncidentDetail] = useState<Incident | null>(null);

  async function fetchIncidents(role:string,admin_id: string|null){
    let data
    if(role === 'superadmin'){
      data = await fetchData(`/api/incidents/admin?count=false`,setIsLoading);
    }else{
      data = await fetchData(`/api/incidents?adminId=${admin_id}&count=false`,setIsLoading);
    }
    const sortedData = sortIncidentBySeverity(data)
    setIncidents(sortedData)
  }

  async function fetchPendingIncidents(role:string,admin_id: string|null){
    let data : Incident[] 
    if(role === 'superadmin'){
      data  = await fetchData(`/api/incidents/admin/pending?count=false`,setIsLoading);
    }else{
      data = await fetchData(`/api/incidents/pending?adminId=${admin_id}&count=false`,setIsLoading);
    }
    const sortedData = sortIncidentBySeverity(data)
    setPendingIncidents(sortedData)
  }
  
  useEffect(()=>{
    const adminData = localStorage.getItem('admin_user');
    const connectedAdmin : IAdmin = adminData ? JSON.parse(adminData) : null;
    fetchIncidents(connectedAdmin.role,connectedAdmin._id)
    fetchPendingIncidents(connectedAdmin.role,connectedAdmin._id)
  },[refreshCount])

  return (
    <>
      <div className="min-h-screen bg-[#F6F6F8]">
        <Navbar />
        {isLoading && (
            <PageLoader />
        )}
        <main className="container mx-auto p-4">
          <h1 className="text-2xl font-bold text-[#232528] my-6">Incident Management</h1>
          {/* Filters Section */}
          <FilterIncidents setIncidents={setPendingIncidents} setIsLoading={setIsLoading}/>

          {/* Aside Table */}
          <div className="flex flex-col md:flex-row gap-6 h-full">
            {/* Recent Incidents Panel (Left) */}
            <div className="w-full md:flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer">
              <div className="p-5 border-b border-gray-100 bg-[#F6F6F8]">
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
            <div className="w-full md:flex-[2] bg-white rounded-lg shadow overflow-hidden border border-[#F6F6F8]">
              <div className="bg-white rounded-lg shadow-sm border border-[#F6F6F8] overflow-hidden">
                <div className="bg-[#2A2A72] bg-opacity-50 px-6 py-3 border-b border-[#F6F6F8]">
                    <h2 className="text-lg font-semibold text-[#F6F6F8]">
                        Pending Incidents
                    </h2>
                </div>
                <div className="overflow-x-auto rounded-none">
                  <table className="min-w-full divide-y divide-[#F6F6F8] rounded-none">
                    <thead className="bg-[#F6F6F8] bg-opacity-30">
                      <tr className='rounded-none'>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Room</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Reported</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    {pendingIncidents.length === 0 && <tbody className="bg-white divide-y divide-[#F6F6F8]">
                        <tr><td className="px-6 py-4 whitespace-normal break-words text-sm font-medium text-[#232528]">No Incident</td></tr>
                      </tbody>}
                    <tbody className="bg-white divide-y divide-[#F6F6F8]">
                      {pendingIncidents.slice((page - 1) * 5, page * 5).map((incident) => (
                        <tr key={incident._id} className="hover:bg-[#F6F6F8] hover:bg-opacity-30">
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