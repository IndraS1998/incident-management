'use client';
import { useState,useEffect,useMemo } from 'react';
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
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

  // *** Functionality related to filtering incidents ***
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    severity: '',
    period: '',
  });

  const filteredAndSortedIncidents = useMemo(() => {
    // First: filter by search term and severity
    let result = pendingIncidents.filter(incident =>
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.department.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(incident =>
      (filters.severity === '' || incident.severity === filters.severity)
    );

    // Then: sort by period if a period filter is selected
    if (filters.period) {
      result = [...result].sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        
        if (filters.period === 'Most Recent') {
          return dateB.getTime() - dateA.getTime(); // Newest first
        } else { // 'Oldest'
          return dateA.getTime() - dateB.getTime(); // Oldest first
        }
      });
    }

    return result;
  }, [pendingIncidents, searchTerm, filters.severity, filters.period]);

  const clearFilters = () => {
    setFilters({ severity: '', period: ''});
    setSearchTerm('');
  };


  return (
    <>
      <div className="min-h-screen bg-[#F6F6F8]">
        <Navbar />
        {isLoading && (
            <PageLoader />
        )}
        <main className="container mx-auto p-4">
          <h1 className="text-2xl font-bold text-[#232528] my-6">Incident Management</h1>
          <div className="flex flex-col md:flex-row gap-8 h-full">
            {/* Recent Incidents Panel (Left) */}
            <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer">
              <div className="p-5 border-b border-gray-100 bg-[#f2f8fd]">
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
            <div className="w-full md:w-2/3 bg-white rounded-lg shadow overflow-hidden border border-[#F6F6F8] p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Pending Incidents</h2>
                  <div className="relative w-full sm:w-96">
                      <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search by department or description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                  </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 bg-[#f2f8fd] rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <FunnelIcon className="w-4 h-4" />
                  <span>Filter by:</span>
                </div>
                  
                <div className="flex flex-wrap gap-3">
                  <select
                    className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                    value={filters.severity}
                    onChange={(e) => setFilters({...filters, severity: e.target.value})}
                  >
                    <option value="">Severity</option>
                    {[IncidentSeverity.CRITICAL,IncidentSeverity.HIGH,IncidentSeverity.MEDIUM,IncidentSeverity.LOW].map((s,i) =>(
                      <option value={s} key={i}>{s}</option>
                    ))}
                  </select>

                  <select
                    className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                    value={filters.period}
                    onChange={(e) => setFilters({...filters, period: e.target.value})}
                  >
                    <option value="">Period</option>
                    {['Most Recent','Oldest'].map((s,i) =>(
                      <option value={s} key={i}>{s}</option>
                    ))}
                  </select>

                  <button onClick={clearFilters}
                  className="cursor-pointer flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* incidents Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Department</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Room</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Severity</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Reported</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAndSortedIncidents.slice((page - 1) * 5, page * 5).map((incident) => (
                        <tr key={incident._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">{incident.description}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{incident.department.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 uppercase">
                            {incident.building_name} - Floor {incident.floor_number} - Room {incident.room_number}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${incident.severity === IncidentSeverity.CRITICAL ? 'bg-red-200 text-red-600' : 
                                incident.severity === IncidentSeverity.HIGH ? 'bg-orange-100 text-orange-600' : 
                                incident.severity === IncidentSeverity.MEDIUM ? 'bg-yellow-100 text-yellow-600' : 
                                'bg-blue-100 text-blue-600'}`}>
                              {incident.severity}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {timeSince(new Date(incident.created_at))}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
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

              {filteredAndSortedIncidents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No incidents found matching your criteria.
                </div>
              )}
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