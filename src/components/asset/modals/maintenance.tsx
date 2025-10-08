import React from 'react'
import { useForm } from "react-hook-form";
import { alertService } from '@/lib/alert.service';
import { fetchData } from '@/lib/functions';
import { AssetModalProps, MaintenanceType,MaintenanceModalFormProps } from '../dataTypes';
import Modal from '@/components/modalParent';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

const MaintenanceModal: React.FC<AssetModalProps> = ({asset,isModalOpen,setIsModalOpen,handleRefresh}) => {
    const { register, handleSubmit, reset, formState: { errors,isValid }} = useForm<MaintenanceModalFormProps>({
        defaultValues:{
            maintenance_type: undefined,
            notes:'',
            next_due_date: addMonthsToDate(asset?.maintenance_frequency ?? 0),
        }
    });
    
    return(
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Asset Maintenance"
            subtitle="Manage the maintenance schedule for your asset"
            height='lg'
      >
        <form onSubmit={handleSubmit(async (data) =>{
            console.log(data)
        })} className='px-2'>
            <div className='mb-4'>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
                <select
                {...register('maintenance_type', { required: true })}
                className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                >
                    <option value="">Select maintenance type</option>
                    {[MaintenanceType.ROUTINE, MaintenanceType.REPAIR, MaintenanceType.UPGRADE].map( t => (
                        <option value={t} key={t} >{t}</option>
                    ))}
                </select>
                {errors.maintenance_type && <p className="text-red-500 text-xs mt-1">{errors.maintenance_type.message}</p>}
            </div>
            <div className='mb-4'>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Note</label>
                <textarea
                    {...register("notes",{required : true})}
                    className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                    rows={5}
                />
                {errors.notes && <p className='text-red-500 text-xs mt-1'>{errors.notes.message}</p>}
            </div>
            <div className='mb-4'>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Due Date
                </label>
                <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                    {...register('next_due_date',{ valueAsDate: true})}
                />
                {errors.next_due_date && <p className='text-red-500 text-xs mt-1'>{errors.next_due_date.message}</p>}
                <div className='text-[#FFA400] bg-[#FFA400]/8 text-sm font-medium mt-2 p-6 inline-flex items-center'>
                    <InformationCircleIcon className="h-8 w-8 mr-2"/>
                    <p>
                        The default due date is set to <span>{addMonthsToDate(asset?.maintenance_frequency ?? 0).toDateString()}</span>. 
                        You can overide it by selecting a new date. 
                    </p>
                </div>
            </div>
            <button type="submit" disabled={!isValid}
                className="w-full rounded-md bg-[#2A2A72] text-white py-2 hover:bg-[#2A2A72]/90 disabled:opacity-50 cursor-pointer"
            >
                Submit
            </button>
        </form>
      </Modal>  
    )
}

const addMonthsToDate = (monthsToAdd: number): Date => {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsToAdd);
  return date;
}

export default MaintenanceModal