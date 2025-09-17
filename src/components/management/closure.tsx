import React,{useState} from 'react'
import { useForm } from "react-hook-form";
import { IncidentUpdateFormProps,ClosureProps,IAdmin } from '@/types/management/form';
import { IncidentInfo,getAISuggestion,AISuggestion } from '@/lib/ai.service';
import { alertService } from '@/lib/alert.service';


const Closure : React.FC<ClosureProps> = ({incident, setIncident,isLoading, setIsLoading,setRefreshCount,refreshCount}) =>{
    const [aiSuggested,setAiSuggested] = useState<boolean>(false);
    const [aiSuggestionLoading,setAiSuggestionLoading] = useState<boolean>(false);
    const { register, handleSubmit, watch, reset, setValue , formState: { errors, isValid }} = useForm<IncidentUpdateFormProps>();
    const status = watch("status");

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
          setAiSuggested(false);
        } catch (err) {
          console.error(err);
          alertService.error('Failed to update Incident')
        } finally {
          setIsLoading(false);
        }
    };

    return(
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl border border-[#EAF6FF]">
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
                        setAiSuggested(false)
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
                            <option value="">Select</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    {/* Resolution Fields (only if Resolved) */}
                    {status === "resolved" && (
                        <>
                        {/* AI Suggest Button */}
                        {!aiSuggested && (
                        <div className="flex justify-start mb-2">
                            <button onClick={async ()=>{
                                const incidentInfo : IncidentInfo = {
                                    description: incident.description,
                                    severity: incident.severity,
                                    department: incident.department.name,
                                }
                                setAiSuggestionLoading(true);
                                try{
                                const suggestion : AISuggestion = await getAISuggestion(incidentInfo);
                                if(suggestion.incident_type.includes('|')){
                                    const incident_types = suggestion.incident_type.split('|').map(t => t.trim().toLowerCase());
                                    setValue("incident_type", incident_types[0],{ shouldValidate: true, shouldDirty: true });
                                }else{
                                    setValue("incident_type", suggestion.incident_type.toLowerCase(),{ shouldValidate: true, shouldDirty: true });
                                }
                                
                                if(suggestion.resolution_strategy_type.includes('|')){
                                    const resolution_types = suggestion.resolution_strategy_type.split('|').map(t => t.trim().toLowerCase());
                                    setValue("resolution_strategy_type", resolution_types[0],{ shouldValidate: true, shouldDirty: true });
                                }else{
                                    console.log(suggestion.resolution_strategy_type)
                                    setValue("resolution_strategy_type", suggestion.resolution_strategy_type.toLowerCase(),{ shouldValidate: true, shouldDirty: true });
                                }
                                setValue("diagnosis", suggestion.diagnosis,{ shouldValidate: true, shouldDirty: true });
                                setValue("recommendation", suggestion.recommendation,{ shouldValidate: true, shouldDirty: true });
                                setValue("measure", suggestion.measure.join('\n'),{ shouldValidate: true, shouldDirty: true });
                                setAiSuggested(true)
                                }catch(error){
                                    console.log(error)
                                    alertService.error('Failed to get AI suggestion. Please try again later')
                                }finally{
                                    setAiSuggestionLoading(false);
                                }
                            }} type="button"
                                disabled={aiSuggestionLoading}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md 
                                    ${aiSuggestionLoading?'bg-gray-300 text-gray-500 py-2 cursor-disabled':'cursor-pointer bg-[#FFA400] text-white hover:bg-[#e69500] transition'}`}
                            >
                                {aiSuggestionLoading ? "Loading..." : "✨ Let AI Suggest"}
                            </button>
                        </div>)}

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
                            rows={2}
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
                            rows={2}
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