'use client'
import Footer from "@/components/footerComponent";
import Navbar from "@/components/navbar";
import { useState,useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import PageLoader from "@/components/loaders/pageLoaders";
import { alertService } from "@/lib/alert.service";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { AssetState } from "@/lib/models";
import { fetchData } from "@/lib/functions"; 

interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  location: string;
  age: string;
  maintenance: string;
}

interface AssetType {
  _id: string;
  name: string;
  description: string;
}

interface AssetCreationForm{
  name: string;
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
  const [isModalOpen,setIsModalOpen] = useState<boolean>(false);
  const { register, handleSubmit,setValue, watch, reset, formState: { errors } } = useForm<AssetCreationForm>();
  const state = watch('state');

  async function fetchAssetTypes(){
    const data = await fetchData('/api/assets/types',setLoading)
    setTypes(data)
  }

  useEffect(() =>{
    fetchAssetTypes();
  },[])

  useEffect(() => {
    if (state === 'in_use') {
      setIsModalOpen(true)
    }
  }, [state])

  function closeModal(){
    setIsModalOpen(false)
  }

  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'Laptop - Engineering',
      type: 'Laptop',
      serialNumber: 'SN12345',
      location: 'Office - Floor 3',
      age: '1 year',
      maintenance: 'Due soon'
    },
    {
      id: '2',
      name: 'Server - Database',
      type: 'Server',
      serialNumber: 'SV67890',
      location: 'Data Center - Rack A',
      age: '3 years',
      maintenance: 'Overdue'
    },
    {
      id: '3',
      name: 'Desktop - Design',
      type: 'Desktop',
      serialNumber: 'DS24680',
      location: 'Office - Floor 2',
      age: '6 months',
      maintenance: 'Up to date'
    },
    {
      id: '4',
      name: 'Network Switch',
      type: 'Switch',
      serialNumber: 'NS13579',
      location: 'Network Room',
      age: '2 years',
      maintenance: 'Up to date'
    },
    {
      id: '5',
      name: 'Printer - Office',
      type: 'Printer',
      serialNumber: 'PR98765',
      location: 'Office - Floor 1',
      age: '4 years',
      maintenance: 'Overdue'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    age: '',
    maintenance: ''
  });

  const [newAsset, setNewAsset] = useState({
    name: '',
    type: '',
    serialNumber: '',
    location: ''
  });

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(asset =>
    (filters.type === '' || asset.type === filters.type) &&
    (filters.age === '' || asset.age === filters.age) &&
    (filters.maintenance === '' || asset.maintenance === filters.maintenance)
  );

  const handleCreateAsset = () => {
    if (newAsset.name && newAsset.type && newAsset.serialNumber && newAsset.location) {
      const asset: Asset = {
        id: Date.now().toString(),
        name: newAsset.name,
        type: newAsset.type,
        serialNumber: newAsset.serialNumber,
        location: newAsset.location,
        age: '0 days',
        maintenance: 'Up to date'
      };
      setAssets([...assets, asset]);
      setNewAsset({ name: '', type: '', serialNumber: '', location: '' });
    }
  };

  const clearFilters = () => {
    setFilters({ type: '', age: '', maintenance: '' });
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

  const getMaintenanceColor = (status: string) => {
    switch (status) {
      case 'Overdue': return 'text-red-600 bg-red-50';
      case 'Due soon': return 'text-yellow-600 bg-yellow-50';
      case 'Up to date': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-[#F6F6F8]">
      {loading && <PageLoader />}
      {isModalOpen && <ModalContent closeModal={closeModal} onConfirm={handleModalConfirm} />}
      <Navbar />
      <div className="container mx-auto p-4 min-h-[74vh]">
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
              //const result = await response.json()
              alertService.success('Asset created successfully')
              reset()
            }catch(error){
              console.log(error)
              alertService.error('Error creating asset. Please try again later')
            }finally{
              setLoading(false)
            }
            console.log(data)
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
                  Asset Name
                </label>
                <input type="text" placeholder="e.g., Printer 1 SecSG"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                  {...register('name',{required:true})}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
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
                    <option value={s.code} key={s.code}>{s.str}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
              </div>
              <button onClick={handleCreateAsset}
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
                          <option value="Laptop">Laptop</option>
                          <option value="Desktop">Desktop</option>
                          <option value="Server">Server</option>
                          <option value="Printer">Printer</option>
                          <option value="Switch">Switch</option>
                      </select>

                      <select
                      className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                      value={filters.age}
                      onChange={(e) => setFilters({...filters, age: e.target.value})}
                      >
                          <option value="">Age</option>
                          <option value="6 months">6 months</option>
                          <option value="1 year">1 year</option>
                          <option value="2 years">2 years</option>
                          <option value="3 years">3 years</option>
                          <option value="4 years">4 years</option>
                      </select>

                      <select
                      className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                      value={filters.maintenance}
                      onChange={(e) => setFilters({...filters, maintenance: e.target.value})}
                      >
                          <option value="">Maintenance</option>
                          <option value="Up to date">Up to date</option>
                          <option value="Due soon">Due soon</option>
                          <option value="Overdue">Overdue</option>
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
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Asset Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Serial No.</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Location</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Age</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Maintenance</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{asset.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{asset.type}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{asset.serialNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{asset.location}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{asset.age}</td>
                      <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceColor(asset.maintenance)}`}>
                          {asset.maintenance}
                          </span>
                      </td>
                      <td className="py-3 px-4">
                          <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          💤
                          </button>
                      </td>
                      </tr>
                  ))}
                  </tbody>
              </table>
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