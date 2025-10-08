import React from "react"
import { AssetModalProps } from "../dataTypes"
import Modal from "@/components/modalParent"
import { Grid2X2Plus } from "lucide-react"
import { AssetState,StateChangeFormProps } from "../dataTypes"
import { useForm } from "react-hook-form"

const StateChangeModal : React.FC<AssetModalProps> = ({asset,isModalOpen,setIsModalOpen,handleRefresh}) =>{
    const { register, handleSubmit, formState: { errors, isValid } } = useForm<StateChangeFormProps>();
        
    return(
        <Modal isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Asset Movements"
            subtitle="Manage the location and movement for your asset"
            height='lg'>
                <form className='px-2'>
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-[#232528] mb-1">Current State</label>
                        <div className='text-[#323d48] bg-[#323d48]/8 text-md font-medium mt-2 p-6 inline-flex items-center w-full'>
                            <Grid2X2Plus className="h-8 w-8 mr-2"/>
                            <p className="capitalize">
                                Asset is {asset?.state.split('_').join(' ')} 
                            </p>
                        </div>
                    </div>
                    <div className="mb-2">
                        <label className="block text-sm font-medium text-[#232528] mb-1">New State *</label>
                        <select
                            {...register('new_state', { required: 'Asset state is required' })}
                            className="w-full p-3 border text-[#232528] border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                        >
                            <option value="">Select State</option>
                            {[AssetState.IN_STOCK,AssetState.IN_USE,AssetState.RETIRED,AssetState.UNDER_MAINTENANCE,AssetState.HAS_ISSUES].filter(as => as !== asset?.state).map(as =>{
                                return <option  className="capitalize" value={as} key={as}>{as.split('_').join(' ')}</option>
                            })}
                        </select>
                        {errors.new_state && <p className="text-red-500 text-xs mt-1">{errors.new_state.message}</p>}
                    </div>
                    <div className='mb-4'>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State Change Note *</label>
                        <textarea
                            {...register("notes",{required : true})}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                            rows={5}
                        />
                        {errors.notes && <p className='text-red-500 text-xs mt-1'>{errors.notes.message}</p>}
                    </div>
                    <button type="submit" disabled={!isValid}
                        className="w-full rounded-md bg-[#2A2A72] text-white py-2 hover:bg-[#2A2A72]/90 disabled:opacity-50 cursor-pointer">
                        Submit
                    </button>
                </form>
        </Modal>
    )
} 

export default StateChangeModal