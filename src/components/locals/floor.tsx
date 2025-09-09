'use client'
import {useForm} from 'react-hook-form';
import { useState,useEffect } from 'react';
import { alertService } from '@/lib/alert.service';
import TableSkeleton from './skeleton';
import React from 'react';

type modalMode = 'create' | 'edit';

interface Floor {
  _id: string;
  floor_number: number;
  building_name: string;
}

interface BuildingGroup {
  _id: string; 
  building_name:string;
  floors: Floor[];
}

export default function Floors(){
    const [data, setData] = useState<BuildingGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [modalState, setModalState] = useState<{
        open: boolean;
        mode: modalMode;
        FloorData: Floor | null;
    }>({
        open: false,
        mode: 'create',
        FloorData: null
    });

     // Fetch floors
    const fetchFloors = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/locals/floors');
            if (!res.ok){
                alertService.error('Failed to fetch floors');
                setError(await res.text());
                return;
            }
            const data = await res.json();
            setData(data)
        } catch (err) {
            alertService.error('Failed to fetch floors');
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFloors();
    }, []);

     // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBuildings = data.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(data.length / itemsPerPage)

    const handleEdit = (floor: Floor) => {
        setModalState({
            open: true,
            mode: 'edit',
            FloorData: floor 
        });
    };

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
            {/* Add New Button */}
            <div className="mt-2 mb-2 flex justify-start">
                <button onClick={() => setModalState({ open: true, mode: 'create', FloorData: null })}
                 className="px-4 py-2 bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md capitalize cursor-pointer">
                    + Add New Floor
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-[#EAF6FF] overflow-x-auto w-full">
                <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
                    <thead className="bg-[#2A2A72] text-[#EAF6FF] bg-opacity-30 text-sm uppercase">
                        <tr>
                            <th className="px-4 py-2 text-left">Floor ID</th>
                            <th className="px-4 py-2 text-left">Floor Number</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                    {currentBuildings.map((group) => (
                        <React.Fragment key={group._id}>
                            {/* Building header row */}
                            <tr key={group._id} className="bg-[#EAF6FF] font-semibold">
                                <td colSpan={3} className="px-4 py-2 font-bold text-gray-900">
                                {group._id}
                                </td>
                            </tr>

                            {/* Floors under this building */}
                            {group.floors.map((floor) => (
                                <tr key={floor._id} className="border-t hover:bg-gray-50 transition">
                                    <td className="px-4 py-2">{floor._id}</td>
                                    <td className="px-4 py-2">{floor.floor_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232528]">
                                        <div className="flex space-x-2">
                                            <button onClick={() =>{handleEdit(floor)}}
                                                className="text-[#FFA400] hover:text-[#e69500] cursor-pointer">
                                                Edit
                                            </button>
                                            <button className="text-red-500 hover:text-red-700 cursor-pointer">
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </ React.Fragment>
                    ))}
                    </tbody>
                </table>

                {/* Pagination controls */}
                <div className="flex justify-between items-center mt-4">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                        Previous
                    </button>
                    <p className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </p>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50">
                        Next
                    </button>
                </div>
            </div>

            {modalState.open && (
                <ModalContent onClose={() => setModalState({ ...modalState, FloorData: null, open: false })} refreshBuildings={fetchFloors}
                    mode={modalState.mode} floorData={modalState.FloorData} />
            )}
        </>
    )
}

function ModalContent({ onClose, refreshBuildings, mode = 'create', floorData = null }: {
  onClose: () => void;
  refreshBuildings: () => void;
  mode?: modalMode;
  floorData?: Floor | null;
}){
    const [buildings,setBuildings] = useState<BuildingGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { register, handleSubmit, formState: { errors } } = useForm<Floor>({
        defaultValues:{
            _id: floorData ? floorData._id : '',
            building_name: floorData ? floorData.building_name : '',
            floor_number: floorData ? floorData.floor_number : 0,
        }
    });

    const onSubmit = async (data: Floor) => {
        setLoading(true)
        const method = mode === 'create' ? 'POST' : 'PATCH';
        try {
            const response = await fetch('/api/locals/floors', {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }
            alertService.success('Building created successfully!');
            refreshBuildings();
            onClose();
        } catch (error) {
            console.log(error)
            alertService.error('Failed to create floor');
        }finally{
            setLoading(false)
        }
    };

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

    return (
        <div className="fixed inset-0 bg-white/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                {/* Loading overlay - only shown when loading */}
                {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-t-[#2A2A72] border-r-[#2A2A72] border-b-transparent border-l-transparent"></div>
                    </div>
                )}
                <div className="bg-[#2A2A72] text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{mode === 'create' ? 'Add New Floor' : 'Edit Floor'}</h3>
                    <button onClick={onClose} className="text-white hover:text-[#FFA400] cursor-pointer">
                        ✕
                    </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Building Name *
                        </label>
                        <select className={`w-full p-2 border ${
                                errors.building_name ? 'border-red-500' : 'border-[#EAF6FF]'
                                } rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none`}
                                {...register('building_name', { required: 'Building Name is required' })}
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
                        <input
                            type="number"
                            className={`w-full p-2 border ${
                            errors.building_name ? 'border-red-500' : 'border-[#EAF6FF]'
                            } rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none`}
                            placeholder="e.g. 2"
                            {...register('floor_number', {
                                required: 'Floor number is required',
                                valueAsNumber: true,
                                min: { value: -100, message: 'Floor number can be negative (e.g. basements)' }
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
                            {mode === 'create' ? 'Create Floor' : 'Edit Floor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
  );
}