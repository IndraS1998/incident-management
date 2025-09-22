'use client'
import {useForm} from 'react-hook-form';
import { useState,useEffect,useCallback } from 'react';
import { alertService } from '@/lib/alert.service';
import {LocalEntity,IFloor} from '@/lib/types/cms.types';
import TableSkeleton from './skeleton';
import React from 'react';
import Pagination from '../Pagination/file';
import PageLoader from '../loaders/pageLoaders';

type modalMode = 'create' | 'edit';

interface Department{
    _id:string;
    department_id:string;
}
interface Room{
    _id:string;
    department_id:Department | null;
    room_number:string;
}

interface Floor{
    floor_number:number;
    rooms:Room[];
}

interface RoomWithHierarchy{
    building_name:string;
    floors:Floor[];
}

export default function Rooms(){
    const [rooms, setRooms] = useState<RoomWithHierarchy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);

    const [modalState, setModalState] = useState<{
        open: boolean;
        mode: modalMode;
        RoomData: LocalEntity | null;
    }>({
        open: false,
        mode: 'create',
        RoomData: null
    });


     // Fetch rooms
    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/locals/rooms');
            if (!res.ok){
                alertService.error('Failed to fetch floors');
                setError(await res.text());
                return;
            }
            const data = await res.json();
            setRooms(data);
        } catch (err) {
            alertService.error('Failed to fetch rooms');
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);
    /*
    const handleEdit = (floor: LocalEntity) => {
        setModalState({
            open: true,
            mode: 'edit',
            RoomData: floor // This will have floor_number available
        });
    };
    */
    if (loading){
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-[#232528] mb-2">Buildings</h1>
                <TableSkeleton 
                    rowCount={3}
                    colCount={3} // ID, Name, Floors
                    hasActions={true}
                />
            </div>
        )
    };

    if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

    return(
       <>
            <div className="mt-2 mb-2 flex justify-start">
                <button onClick={() => {
                    setModalState({
                        open: true,
                        mode: 'create',
                        RoomData: null // This will have floor_number available
                    });
                }}
                    className="px-4 py-2 bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md capitalize cursor-pointer">
                    + Add New Room
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-[#EAF6FF] overflow-x-auto w-full">
                <table className="min-w-full border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <thead className="bg-[#2A2A72] text-[#EAF6FF] text-sm uppercase">
                        <tr>
                        <th className="px-4 py-2 text-left">Room Number</th>
                        <th className="px-4 py-2 text-left">Department</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.slice(((page - 1) * 5),(page * 5)).map((building) => (
                            <React.Fragment key={building.building_name}>
                                {/* Building row */}
                                <tr className="bg-[#009FFD]">
                                    <td
                                        colSpan={3}
                                        className="px-4 py-2 text-left font-bold text-[#EAF6FF] text-base"
                                    >
                                        {building.building_name}
                                    </td>
                                </tr>

                                {/* Floors under this building */}
                                {building.floors.map((floor) => (
                                    <React.Fragment key={floor.floor_number}>
                                        {/* Floor row */}
                                        <tr className="bg-[#EAF6FF] border-t">
                                            <td colSpan={3} className="px-6 py-2 text-sm font-semibold text-[#2A2A72]">
                                                Etage {floor.floor_number}
                                            </td>
                                        </tr>

                                        {/* Rooms under this floor */}
                                        {floor.rooms.map((room) => (
                                            <tr key={room._id} className="border-t hover:bg-gray-50 transition">
                                                <td className="px-8 py-3 whitespace-nowrap text-sm text-[#232528]">
                                                    {room.room_number}
                                                </td>
                                                <td className="px-8 py-3 whitespace-nowrap text-sm text-[#232528]">
                                                {room.department_id
                                                    ? room.department_id.department_id
                                                    : "N/A"}
                                                </td>
                                                <td className="px-8 py-3 whitespace-nowrap text-sm text-[#232528]">
                                                    <div className="flex space-x-3">
                                                        <button onClick={() => {}} className="text-[#FFA400] hover:text-[#e69500] font-medium">
                                                            Edit
                                                        </button>
                                                        <button className="text-red-500 hover:text-red-700 font-medium">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
                <Pagination currentPage={page} onPageChange={setPage} totalPages={Math.ceil(rooms.length/5)}/>
            </div>

            {modalState.open && (
                <ModalContent onClose={() => setModalState({ ...modalState, RoomData: null, open: false })} refreshBuildings={fetchRooms}
                    mode={modalState.mode} roomData={modalState.RoomData} />
            )}
        </>
    )
}

function ModalContent({ onClose, refreshBuildings, mode = 'create', roomData = null }: {
  onClose: () => void;
  refreshBuildings: () => void;
  mode?: modalMode;
  roomData?: LocalEntity | null;
}){
    const [buildings,setBuildings] = useState<LocalEntity[]>([]);
    const [selectedBuilding,setSelectedBuilding] = useState<string | null>(null)
    const [floors,setFloors] = useState<LocalEntity[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { register, handleSubmit, formState: { errors } } = useForm<LocalEntity>({
        defaultValues:{
            _id: roomData ? roomData._id : '',
            building_name: roomData ? roomData.building_name : '',
            floor_number: roomData ? (roomData.type === 'floor' ? roomData.floor_number : 0) : 0, // Default to 0 if not provided
        }
    });

    const onSubmit = async (data: LocalEntity) => {
        setLoading(true)
        const method = mode === 'create' ? 'POST' : 'PATCH';
        try {
            const response = await fetch('/api/locals/rooms', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }
            alertService.success('Room created successfully!');
            refreshBuildings();
            onClose();
        } catch (error) {
            console.log(error)
            alertService.error('Failed to create room');
        }finally{
            setLoading(false)
        }
    };

    const fetchFloors = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/locals/floors?building_name=${selectedBuilding}`);
            if (!res.ok){
                alertService.error('Failed to fetch floors');
                close()
                return;
            }
            const data = await res.json();
            const floorsWithType: IFloor[] = data.map((floor: Omit<IFloor, 'type'>) => ({
                ...floor,
                type: 'floor'
            }));
            setFloors(floorsWithType);
        } catch (err) {
            console.log(err)
            alertService.error('Failed to fetch floors');
            close()
        } finally {
            setLoading(false);
        }
    }, [selectedBuilding]);

    const fetchBuildings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/locals/buildings');
            if (!res.ok){
                alertService.error('Failed to fetch buildings');
                close()
                return;
            }
            const data = await res.json();
            setBuildings(data);
        } catch (err) {
            console.log(err)
            alertService.error('Failed to fetch buildings');
            close()
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    useEffect(() =>{
        fetchFloors();
    },[fetchFloors]);

    return (
        <div className="fixed inset-0 bg-white/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                {/* Loading overlay - only shown when loading */}
                {loading && (
                    <PageLoader />
                )}
                <div className="bg-[#2A2A72] text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{mode === 'create' ? 'Add New Room' : 'Edit Room'}</h3>
                    <button onClick={onClose} className="text-white hover:text-[#FFA400] cursor-pointer">
                        ✕
                    </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Building Name *
                        </label>
                        <select
                            className={`w-full p-2 border ${
                                errors.building_name ? 'border-red-500' : 'border-[#EAF6FF]'
                            } rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none`}
                            {...register('building_name', { required: 'Building Name is required' })}
                            onChange={e => {
                                setSelectedBuilding(e.target.value);
                            }}
                            value={selectedBuilding ?? ''}
                        >
                            <option value="">Select Building</option>
                            {buildings.map(building => (
                                <option key={building._id} value={building.building_name}>
                                    {building.building_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Floor Number *
                        </label>
                        <select className={`w-full p-2 border ${
                                errors.building_name ? 'border-red-500' : 'border-[#EAF6FF]'
                                } rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none`}
                                {...register('floor_number', { required: 'Floor number is required' })}
                            >
                            <option value="">Select Floor</option>
                            {floors.map(floor => (
                                <option key={floor._id} value={floor.type === 'floor' ? floor.floor_number : ''}>
                                    {floor.type === 'floor' ? floor.floor_number : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Room Number *
                        </label>
                        <input
                            type="text"
                            className={`w-full p-2 border ${
                            errors.building_name ? 'border-red-500' : 'border-[#EAF6FF]'
                            } rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none`}
                            placeholder="e.g. 2"
                            {...register('room_number', {
                                required: 'Room number is required',
                                valueAsNumber: true,
                                min: { value: -100, message: 'Room number can be negative (e.g. basements)' }
                            })}
                            />
                            {errors.building_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.building_name.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-[#EAF6FF] cursor-pointer text-[#232528] rounded-md hover:bg-[#EAF6FF] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 cursor-pointer bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md transition-colors"
                        >
                            {mode === 'create' ? 'Create Room' : 'Edit Room'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
  );
}