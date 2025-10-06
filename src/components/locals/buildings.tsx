'use client'
import {useForm} from 'react-hook-form';
import { useState,useEffect } from 'react';
import { alertService } from '@/lib/alert.service';
import LocalsTable from './table';
import {LocalEntity} from '@/lib/types/cms.types';
import TableSkeleton from './skeleton';
import Pagination from '../Pagination/file';
import { fetchData } from '@/lib/functions';

type modalMode = 'create' | 'edit';

export default function Buildings(){
    const [buildings, setBuildings] = useState<LocalEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page,setPage] = useState<number>(1)

    const [modalState, setModalState] = useState<{
        open: boolean;
        mode: 'create' | 'edit';
        buildingData: LocalEntity | null;
    }>({
        open: false,
        mode: 'create',
        buildingData: null
    });

    // Fetch buildings
    const fetchBuildings = async () => {
        const data = await fetchData('/api/locals/buildings',setLoading)
        if(data){
            setBuildings(data);
        }
    };

    useEffect(() => {
        fetchBuildings();
    }, []);

    const handleEdit = (building: LocalEntity) => {
        setModalState({
            open: true,
            mode: 'edit',
            buildingData: building
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
            <LocalsTable tabBody={buildings.slice(((page - 1) * 5),(page * 5)).map(building => [building._id, building.building_name])}
                tabHead={['ID', 'Name']} 
                tabTitle='Buildings' 
                buttonText='building' 
                setCreationModal={() => setModalState({ buildingData: null, mode: 'create', open: true })}
                setEditModal={(building: LocalEntity) => handleEdit(building)}
                entityType='building'
            />
            <Pagination currentPage={page} totalPages={Math.ceil(buildings.length/5)} onPageChange={setPage} />

            {modalState.open && (
                <ModalContent onClose={() => setModalState({ ...modalState, buildingData: null, open: false })} refreshBuildings={fetchBuildings}
                    mode={modalState.mode} buildingData={modalState.buildingData} />
            )}
        </>
    )
}

function ModalContent({ onClose, refreshBuildings, mode = 'create', buildingData = null }: {
  onClose: () => void;
  refreshBuildings: () => void;
  mode?: modalMode;
  buildingData?: LocalEntity | null;
}){
    const { register, handleSubmit, formState: { errors } } = useForm<LocalEntity>({
        defaultValues:{
            _id: buildingData ? buildingData._id : '',
            building_name: buildingData ? buildingData.building_name : '',
        }
    });

    const onSubmit = async (data: LocalEntity) => {
        const method = mode === 'create' ? 'POST' : 'PATCH';
        try {
            const response = await fetch('/api/locals/buildings', {
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
            alertService.error(error instanceof Error ? error.message : 'Failed to create building');
        }
    };
    return (
        <div className="fixed inset-0 bg-white/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="bg-[#2A2A72] text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{mode === 'create' ? 'Add New Building' : 'Edit Building'}</h3>
                    <button onClick={onClose} className="text-white hover:text-[#FFA400] cursor-pointer">
                        ✕
                    </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Building Name *
                        </label>
                        <input
                            type="text"
                            className={`w-full p-2 border ${
                            errors.building_name ? 'border-red-500' : 'border-[#F6F6F8]'
                            } rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none`}
                            placeholder="e.g. Batiment A"
                            {...register('building_name', { 
                                required: 'Building name is required',
                                minLength: {
                                value: 3,
                                message: 'Building name must be at least 3 characters'
                                }
                            })}/>
                            {errors.building_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.building_name.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-[#F6F6F8] cursor-pointer text-[#232528] rounded-md hover:bg-[#F6F6F8] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 cursor-pointer bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md transition-colors"
                        >
                            {mode === 'create' ? 'Create Building' : 'Edit Building'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
  );
}