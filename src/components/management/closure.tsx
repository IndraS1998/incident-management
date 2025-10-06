import React,{useState} from 'react'
import { useForm } from "react-hook-form";
import { IncidentUpdateFormProps,ClosureProps,IAdmin } from '@/types/management/form';
import { alertService } from '@/lib/alert.service';
import AISuggestionFeedback from './loadSuggestion';
import { fetchData } from '@/lib/functions';


const Closure : React.FC<ClosureProps> = ({incident, setIncident,isLoading, setIsLoading,setRefreshCount,refreshCount}) =>{
    const [aiSuggestionLoading,setAiSuggestionLoading] = useState<boolean>(false);
    //const [aiSuggested,setAiSuggested] = useState<boolean>(false);
    const { register, handleSubmit, watch, reset, setValue , formState: { errors, isValid }} = useForm<IncidentUpdateFormProps>();
    const status = watch("status");

    async function onLoadSuggestion(){
        const res = await fetchData(`/api/suggestion?_id=${incident._id}&count=false`,setAiSuggestionLoading)
        if(res.success){
            console.log(res.data)
            setValue("incident_type", res.data.incident_type,{ shouldValidate: true, shouldDirty: true });
            setValue("resolution_strategy_type", res.data.resolution_strategy_type,{ shouldValidate: true, shouldDirty: true });
            setValue("diagnosis", res.data.diagnosis,{ shouldValidate: true, shouldDirty: true });
            setValue("recommendation", res.data.recommendation,{ shouldValidate: true, shouldDirty: true });
            setValue("measure", res.data.measure,{ shouldValidate: true, shouldDirty: true });
            //setAiSuggested(true)
        }
    }

    const onSubmit = async (data : IncidentUpdateFormProps) => {
        const adminData = localStorage.getItem('admin_user');
        const connectedAdmin : IAdmin = adminData ? JSON.parse(adminData) : null;
        setIsLoading(true);
        setIncident(null);
        try {
          const res = await fetch(`/api/incidents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data,incident_id:incident?._id,admin_id:connectedAdmin._id}),
          });
    
          if (!res.ok) throw new Error("Failed to update incident");
          alertService.success('Successfully Updated Incident');
          setRefreshCount(()=>(refreshCount + 1))
          reset();
        } catch (err) {
          console.error(err);
          alertService.error('Failed to update Incident')
        } finally {
          setIsLoading(false);
        }
    };

    return(
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-5">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl border border-[#F6F6F8] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-1">
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Resolve Incident
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {incident.description}
                        </p>
                    </div>
                    <button onClick={() => {
                        reset()
                        setIncident(null)
                    }} className="text-[#232528] hover:text-[#FFA400] cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit(async FD => onSubmit(FD))} className="space-y-4 p-4">
                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Incident Status</label>
                        <select
                        {...register("status", { required: true })}
                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                        >
                            <option value="">Select incident finality</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Not Resolved</option>
                        </select>
                    </div>

                    {/* Resolution Fields (only if Resolved) */}
                    {status === "resolved" && (
                        <>
                        {/* AI Suggest Button */}
                        <AISuggestionFeedback onLoadSuggestion={onLoadSuggestion} onFeedback={()=>{}} isLoading={aiSuggestionLoading} />
                        <div>
                            <label className="block text-sm font-medium mb-1">Incident Type</label>
                            <select {...register("incident_type", { required: true })} className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none">
                                <option value="">Select Incident Type</option>
                                <option value="software">Software</option>
                                <option value="hardware">Hardware</option>
                                <option value="network">Network</option>
                                <option value="security">Security</option>
                                <option value="other">Other</option>
                            </select>
                            {errors.incident_type && <p className="text-red-500 text-xs mt-1">{errors.incident_type.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Resolution Strategy</label>
                            <select {...register("resolution_strategy_type",{required: true})}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                            >
                                <option value="">Select Resolution Strategy</option>
                                <option value="immediate_fix">Immediate Fix</option>
                                <option value="workaround">Workaround</option>
                                <option value="long_term_solution">Long Term Solution</option>
                            </select>
                            {errors.resolution_strategy_type && <p className='text-red-500 text-xs mt-1'>{errors.resolution_strategy_type.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Diagnosis</label>
                            <textarea
                            {...register("diagnosis")}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                            rows={3}
                            />
                            {errors.diagnosis && <p className='text-red-500 text-xs mt-1'>{errors.diagnosis.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Measures Taken</label>
                            <textarea
                            {...register("measure",{required : true})}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                            rows={4}
                            />
                            {errors.measure && <p className='text-red-500 text-xs mt-1'>{errors.measure.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Recommendation (optional)</label>
                            <textarea
                            {...register("recommendation")}
                            className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                            rows={3}
                            />
                        </div>
                        </>
                    )}  

                {/* Submit */}
                    {isValid?(
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full rounded-md bg-[#2A2A72] text-white py-2 hover:bg-[#2A2A72]/90 disabled:opacity-50 cursor-pointer"
                    >
                        {isLoading ? "Updating..." : "Update Incident"}
                    </button>
                    ):(
                        <button
                            type="submit"
                            disabled={true}
                            className="w-full rounded-md bg-gray-300 text-gray-500 py-2 cursor-disabled"
                    >
                        {isLoading ? "Updating..." : "Update Incident"}
                    </button>
                    )}
                
                </form>
            </div>
        </div>
    )
}

export default Closure;