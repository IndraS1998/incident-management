'use client'
import Footer from "@/components/footerComponent";
import Navbar from "@/components/navbar";
import { useState,useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import PageLoader from "@/components/loaders/pageLoaders";
import { alertService } from "@/lib/alert.service";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { fetchData } from "@/lib/functions"; 
import Pagination from "@/components/Pagination/file";
import Link from 'next/link';

enum AssetState {
  IN_STOCK = 'in_stock',
  IN_USE = 'in_use',
  RETIRED = 'retired',
  HAS_ISSUES = 'has_issues',
  UNDER_MAINTENANCE = 'under_maintenance',
}

interface Location{
  building:string;
  department:string;
  floor:number;
  room_number:number;
}

interface Asset {
  _id: string;
  asset_id: string;
  asset_type: string;
  criticality:string;
  model_number: string;
  lifespan:number;
  location: Location | null;
  state: AssetState;
  age: string;
  maintenance_frequency: number;
  date_in_production:string;
}

interface AssetType {
  _id: string;
  name: string;
  description: string;
}

interface AssetCreationForm{
  type: string;
  model_number: string;
  state: AssetState;
  lifespan: number;
  maintenance_frequency: number; 
  age?: number;
  criticality?: 'low' | 'medium' | 'high'; 
  date_in_production?: Date;
  office_id?: string;
}

export default function AssetManagement() {
  const [types,setTypes] = useState<AssetType[]>([]);
  const [loading,setLoading] = useState(true);
  const [assets,setAssets] = useState<Asset[]>([]);
  const [isModalOpen,setIsModalOpen] = useState<boolean>(false);
  const { register, handleSubmit,setValue, watch, reset, formState: { errors } } = useForm<AssetCreationForm>();
  const state = watch('state');
  const [page,setPage] = useState<number>(1)

  async function fetchAssetTypes(){
    const data = await fetchData('/api/assets/types',setLoading)
    setTypes(data)
  }

  async function fetchAssets(){
    const data = await fetchData('/api/assets/creation',setLoading)
    setAssets(data)
  }

  useEffect(() =>{
    fetchAssetTypes();
    fetchAssets();
  },[])

  useEffect(() => {
    if (state === 'in_use') {
      setIsModalOpen(true)
    }
  }, [state])

  function closeModal(){
    setIsModalOpen(false)
  }

  function getAge(dateString: string): number {
    const now = new Date();
    const date = new Date(dateString);
    let age = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }

  function getLifeLeft(dateString: string, lifespan: number): string {
    if(dateString){
      const age = getAge(dateString);
      if(lifespan - age < 0) return 'Expired'
      return `${lifespan - age} years`;
    }else{
      return 'N/A'
    } 
  }
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    age: '',
    status: '',
    maintenance: ''
  });

  const filteredAssets = assets.filter(asset =>
    asset.model_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location?.building.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(asset =>
    (filters.type === '' || asset.asset_type === filters.type) &&
    (filters.age === '' || asset.age === filters.age) &&
    matchesMaintenanceRange(asset.maintenance_frequency, filters.maintenance) &&
    (filters.status === '' || asset.state === filters.status)
  );

  function matchesMaintenanceRange(assetValue: number, filter: string): boolean {
    if (!filter || filter === '') return true;

    switch (filter) {
      case '1-3':
        return assetValue >= 1 && assetValue <= 3;
      case '4-6':
        return assetValue >= 4 && assetValue <= 6;
      case '7-12':
        return assetValue >= 7 && assetValue <= 12;
      case '12+':
        return assetValue > 12;
      default:
        return true;
    }
  }

  const clearFilters = () => {
    setFilters({ type: '', age: '', maintenance: '' , status: ''});
    setSearchTerm('');
  };

  // 🔁 Function to receive data from modal
  const handleModalConfirm = (data: { 
    room: string;
    criticality: 'low' | 'medium' | 'high'; 
    date_in_production: Date; 
  }) => {
    setValue('office_id', data.room)
    setValue('criticality', data.criticality)
    setValue('date_in_production', data.date_in_production)
    setIsModalOpen(false)
  }

  const getLifeLeftColor = (lifeLeft:string) => {
    if (lifeLeft === 'Expired') {
      return 'text-red-600 bg-red-50';
    } else if (lifeLeft === '1 years' || lifeLeft === '0 years') {
      return 'text-yellow-600 bg-yellow-50';
    } else if (lifeLeft === '2 years' || lifeLeft === '3 years') {
      return 'text-green-600 bg-green-50';
    } else {
      return 'text-gray-600 bg-gray-50';
    }
  } 
  /*
  const getMaintenanceColor = (status: number) => {
    if (status < 3) {
      return 'text-red-600 bg-red-50';
    } else if (status < 6) {
      return 'text-yellow-600 bg-yellow-50';
    } else if (status < 12) {
      return 'text-green-600 bg-green-50';
    } else {
      return 'text-gray-600 bg-gray-50';
    }
  };*/

  return (
    <div className="bg-[#F6F6F8]">
      {loading && <PageLoader />}
      {isModalOpen && <ModalContent closeModal={closeModal} onConfirm={handleModalConfirm} />}
      <Navbar />
      <div className="container mx-auto p-4 min-h-[84vh]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#232528] ">Asset Management</h1>
          <p className="text-gray-600 text-sm">Create, view, and manage your IT assets.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Create New Asset Section */}
          <form onSubmit={handleSubmit(async (data)=>{
            setLoading(true)
            try{
              const response = await fetch('/api/assets/creation',{
                method:'POST',
                headers:{
                  'Content-Type':'application/json'
                },
                body: JSON.stringify(data)
              })
              if(!response.ok){
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create asset')
              }
              alertService.success('Asset created successfully')
              await fetchAssets()
              reset()
            }catch(error){
              console.log(error)
              alertService.error('Error creating asset. Please try again later')
            }finally{
              setLoading(false)
            }
          })} className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-[#F6F6F8] p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Asset</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                  {...register('type', { required: true })}>
                  <option value="">Select type</option>
                  {types.map(t =>(
                    <option value={t._id} key={t._id}>{t.name}</option>
                  ))}
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serial Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., HP-JK12-34kl"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                  {...register('model_number',{required:true})}
                />
                {errors.model_number && <p className="text-red-500 text-xs mt-1">{errors.model_number.message}</p>}
              </div>
              {/* Lifespan (in years) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lifespan (years)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 5"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                  {...register('lifespan', { required: true, valueAsNumber: true })}
                />
                {errors.lifespan && <p className="text-red-500 text-xs mt-1">{errors.lifespan.message}</p>}
              </div>

              {/* Maintenance Frequency (in months) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Frequency (months)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 6"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                  {...register('maintenance_frequency', { required: true, valueAsNumber: true })}
                />
                {errors.maintenance_frequency && <p className="text-red-500 text-xs mt-1">{errors.maintenance_frequency.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset State
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                  {...register('state', { required: true })}>
                  <option value="">Select state</option>
                  {[{code:'in_stock',str:'In stock'},{code:'in_use',str:'In use'}].map(s =>(
                    <option value={s.code} key={s.code}>{s.str.split('_').join(' ')}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
              </div>
              <button type="submit"
                  className="w-full cursor-pointer  bg-[#FFA400] text-white py-2 px-4 rounded-md hover:bg-[#FFA400]/90 focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:ring-offset-2 transition-colors">
                  Create Asset
              </button>
            </div>
          </form>

          {/* Existing Assets Section */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-[#F6F6F8] p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Existing Assets</h2>
                  <div className="relative w-full sm:w-64">
                      <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search assets..."
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
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      >
                        <option value="">Type</option>
                        {types.map(t =>(
                          <option value={t.name} key={t._id}>{t.name}</option>
                        ))}
                      </select>

                      <select
                      className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}>
                        <option value="">Status</option>
                        {[AssetState.IN_STOCK,AssetState.IN_USE,AssetState.RETIRED,AssetState.UNDER_MAINTENANCE].map(s =>(
                          <option value={s} key={s}>{s.split('_').join(' ')}</option>
                        ))}
                      </select>

                      <select
                        className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                        value={filters.maintenance}
                        onChange={(e) => setFilters({...filters, maintenance: e.target.value})}
                      >
                        <option value="">Maintenance</option>
                        {['1-3','4-6','7-12','12+'].map(r =>(
                          <option value={r} key={r}>every {r} months</option>
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

              {/* Assets Table */}
              <div className="overflow-x-auto">
              <table className="w-full">
                  <thead>
                  <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Serial No.</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Life left </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Maintenance</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                  {filteredAssets.slice((page - 1) * 5, page * 5).map((asset) => (
                      <tr key={asset.asset_id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">{asset.asset_type}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{asset.model_number}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 uppercase">{asset.state.split('_').join(' ')}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {!asset.location && 'N/A' }
                        {asset.location && asset.location.building}
                        {asset.location && `/ Floor ${asset.location.floor}`}
                        {asset.location && `/ Office ${asset.location.room_number}`}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLifeLeftColor(getLifeLeft(asset.date_in_production, asset.lifespan))}`}>
                          {getLifeLeft(asset.date_in_production, asset.lifespan)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        Every {asset.maintenance_frequency} months
                      </td>
                      <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Link
                              href={`/IT_assets/management/${asset._id}`}
                              className="text-blue-800 hover:text-[#232528] text-sm font-medium cursor-pointer"
                            >
                              View Details
                            </Link>
                            <button className="text-[#FFA400] hover:text-[#FFA400]/80 text-sm font-medium cursor-pointer">
                              Delete
                            </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination currentPage={page} totalPages={Math.ceil(assets.length/5)} onPageChange={setPage}/>
            </div>

            {filteredAssets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
                No assets found matching your criteria.
            </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ModalContent({closeModal,onConfirm}: {closeModal: () => void,
  onConfirm: (data: { room: string; criticality: 'low' | 'medium' | 'high'; date_in_production: Date; }) => void  }) {
  const [loading,setLoading] = useState<boolean>(false)
  const [departments,setDepartments] = useState<{_id:string,name:string,department_id:string}[]>([])
  const [buildings,setBuildings] = useState<{_id:string,building_name:string}[]>([])
  const [floors,setFloors] = useState<{_id:string,floor_number:number}[]>([])
  const [rooms,setRooms] = useState<{_id:string,room_number:number}[]>([])

  interface ModalContent{
    department : string;
    building: string;
    floor: number;
    room: string;
    criticality: 'low' | 'medium' | 'high'; 
    date_in_production: Date;
  }

  const { register, watch,setValue,handleSubmit, formState: { errors } } = useForm<ModalContent>();
  const selectedDepartment = watch('department');
  const selectedBuilding = watch('building');
  const selectedFloor = watch('floor');

  async function fetchDepartments(){
    const response = await fetchData('/api/assets/creation/departments',setLoading)
    setDepartments(response)
  }

  const getBuildings = useCallback(async () => {
    const data = await fetchData(`/api/assets/creation/buildings?department_id=${selectedDepartment}`, setLoading);
    setBuildings(data);
  }, [selectedDepartment, setLoading]);

  const getFloors = useCallback(async () => {
    const data = await fetchData(`/api/assets/creation/floors?department_id=${selectedDepartment}&building_name=${selectedBuilding}`, setLoading);
    setFloors(data);
  }, [selectedDepartment, selectedBuilding, setLoading]);

  const getRooms = useCallback(async () => {
    const data = await fetchData(`/api/assets/creation/rooms?department_id=${selectedDepartment}&building_name=${selectedBuilding}&floor_number=${selectedFloor}`, setLoading);
    if(data && data.length > 0){
      setRooms(data);
    }
  }, [selectedDepartment, selectedBuilding, selectedFloor, setLoading]);

  useEffect(()=>{
    fetchDepartments()
  },[])

  useEffect(() => {
    if (selectedDepartment) {
      setValue('building', '');
      setValue('floor', 0);
      setValue('room', '');
      getBuildings()
    }
  }, [selectedDepartment, setValue,getBuildings]);

  useEffect(() => {
    if (selectedBuilding) {
      setValue('floor', 0);
      getFloors()
    }
  }, [selectedBuilding, selectedDepartment, setValue, getFloors]);

  useEffect(() => {
    if (selectedDepartment && selectedBuilding && selectedFloor !== undefined && selectedFloor !== null) {
      setLoading(true)
      setValue('room', '');
      getRooms()
    }
  }, [selectedFloor, selectedBuilding, selectedDepartment, setValue, getRooms]);

  return (
    <div className="fixed inset-0 bg-white/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        {loading && (
          <PageLoader />
        )}
        <div className="bg-[#2A2A72] text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-semibold">Select Equipment Location</h3>
          <button onClick={closeModal} className="text-white hover:text-[#FFA400] cursor-pointer">
              ✕
          </button>
        </div>
        
        <form className="p-6" onSubmit={handleSubmit(onConfirm)}>
          <div className="mb-2">
            <label className="block text-sm font-medium text-[#232528] mb-1">Department *</label>
            <select
              {...register('department', { required: 'Department is required' })}
              className="w-full p-3 border text-[#232528] border-[#F6F6F8] rounded-lg focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
            >
              <option value="">Select Department</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name} ({dept.department_id})</option>
              ))}
            </select>
            {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-[#232528] mb-1">Building *</label>
            <select
              {...register('building', { required: 'Building is required' })}
              className="w-full p-3 border text-[#232528] border-[#F6F6F8] rounded-lg focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
            >
              <option value="">Select Building</option>
              {buildings.map(building => (
                <option key={building._id} value={building.building_name}>{building.building_name}</option>
              ))}
            </select>
            {errors.building && <p className="text-red-500 text-xs mt-1">{errors.building.message}</p>}
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-[#232528] mb-1">Floor *</label>
            <select
              {...register('floor', { 
                required: 'Floor is required',
                valueAsNumber: true
              })}
              className="w-full p-3 text-[#232528]  border border-[#F6F6F8] rounded-lg focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
            >
              <option value="">Select Floor</option>
              {floors.map(floor => (
                <option key={floor._id} value={floor.floor_number}>Floor {floor.floor_number}</option>
              ))}
            </select>
            {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor.message}</p>}
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-[#232528] mb-1">Room *</label>
            <select {...register('room', { required: 'Room is required'})}
              className="w-full p-3 border text-[#232528] border-[#F6F6F8] rounded-lg focus:ring-2 focus:ring-[#FFA400] focus:border-transparent">
              <option value="">Select Room</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id}>Room {room.room_number}</option>
              ))}
            </select>
            {errors.room && <p className="text-red-500 text-xs mt-1">{errors.room.message}</p>}
          </div>
          <div className='mb-2'>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Criticality
            </label>
            <select {...register('criticality',{required:true})}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent">
              <option value="">Select criticality</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className='mb-2'>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date in Production
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
              {...register('date_in_production',{required:true, valueAsDate: true})}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={closeModal}
                className="px-4 py-2 border border-[#F6F6F8] cursor-pointer text-[#232528] rounded-md hover:bg-[#F6F6F8] transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 cursor-pointer bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md transition-colors">
                Confirm
              </button>
          </div>
        </form>
      </div>
    </div>
  );
}