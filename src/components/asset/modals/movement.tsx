import React,{useEffect,useState,useCallback} from 'react'
import { useForm } from "react-hook-form";
import PageLoader from '@/components/loaders/pageLoaders';
import { alertService } from '@/lib/alert.service';
import { fetchData } from '@/lib/functions';
import { AssetModalProps, MovementModalFormProps } from '../dataTypes';
import Modal from '@/components/modalParent';
import { MapPin } from 'lucide-react';
import { formatLocation } from '../functions';

const MovementModal: React.FC<AssetModalProps> = ({asset,isModalOpen,setIsModalOpen,handleRefresh}) =>{
    const [loading,setLoading] = useState<boolean>(false)
    const [departments,setDepartments] = useState<{_id:string,name:string,department_id:string}[]>([])
    const [buildings,setBuildings] = useState<{_id:string,building_name:string}[]>([])
    const [floors,setFloors] = useState<{_id:string,floor_number:number}[]>([])
    const [rooms,setRooms] = useState<{_id:string,room_number:number}[]>([])
    
    const { register, watch,setValue,handleSubmit, formState: { errors, isValid } } = useForm<MovementModalFormProps>();
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


    return(
        <Modal     
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Asset Movements"
            subtitle="Manage the location and movement for your asset"
            height='lg'>
            <form className='px-2'>
                {loading && (
                    <PageLoader />
                )}
                <div className="mb-2">
                    <label className="block text-sm font-medium text-[#232528] mb-1">Current Asset Location</label>
                    <div className='text-[#323d48] bg-[#323d48]/8 text-sm font-medium mt-2 p-6 inline-flex items-center w-full'>
                        <MapPin className="h-8 w-8 mr-2"/>
                        <p>
                            {formatLocation(asset?.location ?? null)} 
                        </p>
                    </div>
                </div>
                <div className="mb-2">
                    <label className="block text-sm font-medium text-[#232528] mb-1">New Department *</label>
                    <select
                        {...register('department', { required: 'Department is required' })}
                        className="w-full p-3 border text-[#232528] border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                    >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                            <option key={dept._id} value={dept._id}>{dept.name} ({dept.department_id})</option>
                        ))}
                    </select>
                    {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department.message}</p>}
                </div>
                <div className="mb-2">
                    <label className="block text-sm font-medium text-[#232528] mb-1">New Building *</label>
                    <select
                        {...register('building', { required: 'Building is required' })}
                        className="w-full p-3 border text-[#232528] border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                    >
                        <option value="">Select Building</option>
                        {buildings.map(building => (
                            <option key={building._id} value={building.building_name}>{building.building_name}</option>
                        ))}
                    </select>
                    {errors.building && <p className="text-red-500 text-xs mt-1">{errors.building.message}</p>}
                </div>
                <div className="mb-2">
                    <label className="block text-sm font-medium text-[#232528] mb-1">New Floor *</label>
                    <select
                        {...register('floor', { 
                            required: 'Floor is required',
                            valueAsNumber: true
                        })}
                        className="w-full p-3 text-[#232528]  border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                    >
                        <option value="">Select Floor</option>
                        {floors.map(floor => (
                            <option key={floor._id} value={floor.floor_number}>Floor {floor.floor_number}</option>
                        ))}
                    </select>
                    {errors.floor && <p className="text-red-500 text-xs mt-1">{errors.floor.message}</p>}
                </div>new_state
                <div className="mb-2">
                    <label className="block text-sm font-medium text-[#232528] mb-1">New Room *</label>
                    <select {...register('room', { required: 'Room is required'})}
                        className="w-full p-3 border text-[#232528] border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFA400] focus:border-transparent">
                        <option value="">Select Room</option>
                        {rooms.map(room => (
                            <option key={room._id} value={room._id}>Room {room.room_number}</option>
                        ))}
                    </select>
                    {errors.room && <p className="text-red-500 text-xs mt-1">{errors.room.message}</p>}
                </div>
                <div className='mb-4'>
                    <label className="block text-sm font-medium text-[#232528] mb-1">Movement Reason *</label>
                    <textarea
                        {...register("reason",{required : true})}
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                        rows={3}
                    />
                    {errors.reason && <p className='text-red-500 text-xs mt-1'>{errors.reason.message}</p>}
                </div>
                <button type="submit" disabled={!isValid}
                    className="w-full rounded-md bg-[#2A2A72] text-white py-2 hover:bg-[#2A2A72]/90 disabled:opacity-50 cursor-pointer">
                    Submit
                </button>
            </form>
        </Modal>
    )
}

export default MovementModal