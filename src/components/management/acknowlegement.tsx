import React,{useState} from 'react'
import { AcknowledgementProps,IncidentUpdateFormProps,IAdmin } from "@/types/management/form";
import { useForm } from "react-hook-form";
import { alertService } from '@/lib/alert.service';
import { IncidentInfo,getAISuggestion,AISuggestion } from '@/lib/ai.service';


const Acknowledgement : React.FC<AcknowledgementProps> = ({incident, setIncident, isLoading, setIsLoading,setRefreshCount,refreshCount}) =>{
    const [aiSuggested,setAiSuggested] = useState<boolean>(false);
    const [aiSuggestionLoading,setAiSuggestionLoading] = useState<boolean>(false);
    const { register, handleSubmit, reset, setValue , formState: { errors, isValid }} = useForm<IncidentUpdateFormProps>();

    async function getSuggestion(){
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
    }

    const onSubmit = async (data : IncidentUpdateFormProps) => {
        const adminData = localStorage.getItem('admin_user');
        const connectedAdmin : IAdmin = adminData ? JSON.parse(adminData) : null;
        setIsLoading(true)
        setIncident(null)

        if(aiSuggested){
            const proposal = {
                admin_id: connectedAdmin._id,
                incident_type: data.incident_type,
                diagnosis: data.diagnosis,
                resolution_strategy_type: data.resolution_strategy_type,
                measure: data.measure,
                recommendation: data.recommendation,
            }
            try{
                const response = await fetch('/api/incidents', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({_id:incident?._id,proposal}),
                })
                if (!response.ok) {
                    alertService.error("Failed to update administrator");
                    return;
                }
                alertService.success('Successfully edited')
                setRefreshCount(()=>(refreshCount + 1))
            }catch(error){
                console.log(error)
                alertService.error('failed to update incident! Please try again later')
            }finally{
                setIsLoading(false)
            }
        }else{
            try{
                const response = await fetch('/api/incidents', {
                    method: 'PATCH',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({_id:incident?._id}),
                })
                if (!response.ok) {
                    alertService.error("Failed to update administrator");
                    return;
                }
                alertService.success('Successfully edited')
                setRefreshCount(()=>(refreshCount + 1))
            }catch(error){
                console.log(error)
                alertService.error('failed to update incident! Please try again later')
            }finally{
                setIsLoading(false)
            }
        }
    };

    return(
        <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl border border-[#F6F6F8] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-[#232528]">Incident Details</h2>
                        <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-gray-500">#{incident.incident_id}</span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full 
                                ${incident.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                incident.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                incident.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'}`}>
                                {incident.status.replace('_', ' ')}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full 
                                ${incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'}`}>
                                {incident.severity}
                            </span>
                        </div> 
                    </div>
                    <button onClick={() => setIncident(null)} className="text-gray-400 hover:text-[#FFA400] transition-colors cursor-pointer">
                        ✕
                    </button>
                </div>

            {/* Main Content */}
                <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
                {/* Incident Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                <p className="mt-1 text-[#232528]">{incident.description}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                                <p className="mt-1 text-[#232528]">
                                {incident.building_name}, Floor {incident.floor_number}, Room {incident.room_number}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Reporter</h3>
                                <p className="mt-1 text-[#232528]">
                                {incident.reporter_full_name}
                                {incident.reporter_contact && (
                                    <span className="block text-sm text-gray-500 mt-1">{incident.reporter_contact}</span>
                                )}
                                <span className="block text-sm text-gray-500">{incident.reporter_email}</span>
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
                                <p className="text-sm text-[#232528]">Reported: {new Date(incident.created_at).toLocaleString()}</p>
                                <p className="text-sm text-[#232528]">Last Updated: {new Date(incident.updated_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Phase 1 Form */}
                    <form onSubmit={handleSubmit(async FD => onSubmit(FD))} className="space-y-6">
                        {/* AI decision */}
                        {!aiSuggested && <div className="bg-[#F6F6F8] border border-[#FFA400] p-4 rounded-lg flex justify-between items-center">
                            <p className="text-sm text-[#232528]">Let AI evaluate the incident and suggest a resolution strategy?</p>
                            <button type="button" onClick={getSuggestion} disabled={aiSuggestionLoading} className={`px-4 py-2 text-sm font-medium rounded-md transition 
                                ${aiSuggestionLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#FFA400] text-white hover:bg-[#e69500] cursor-pointer'}`}>
                                {aiSuggestionLoading ? "Loading..." : "✨ AI Suggestion"}
                            </button>
                        </div>}
                        
                        {aiSuggested && (
                            <>
                                {/* Incident Type */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Suggested Incident Type</label>
                                    <select {...register("incident_type", { required: true })}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2">
                                        <option value="">Select Incident Type</option>
                                        <option value="software">Software</option>
                                        <option value="hardware">Hardware</option>
                                        <option value="network">Network</option>
                                        <option value="security">Security</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.incident_type && <p className="text-red-500 text-xs mt-1">{errors.incident_type.message}</p>}
                                </div>

                                {/* Resolution Strategy */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Suggested Resolution Strategy</label>
                                    <select {...register("resolution_strategy_type", { required: true })}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2">
                                        <option value="">Select Resolution Strategy</option>
                                        <option value="immediate_fix">Immediate Fix</option>
                                        <option value="workaround">Workaround</option>
                                        <option value="long_term_solution">Long Term Solution</option>
                                    </select>
                                </div>

                                {/* Diagnosis */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Probable Diagnosis</label>
                                    <textarea {...register("diagnosis")}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2" rows={3} />
                                </div>

                                {/* Measures */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Proposed Measures</label>
                                    <textarea {...register("measure", { required: true })}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2" rows={4} />
                                </div>

                                {/* Recommendation */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Further Preventory Recommendation</label>
                                    <textarea {...register("recommendation")}
                                        className="w-full rounded-md border border-gray-300 p-2 focus:ring-[#FFA400] focus:ring-2" rows={4} />
                                </div>
                            </>
                        )}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Submit */}
                            <button 
                                type="submit" 
                                disabled={!isValid || isLoading}
                                className={`flex-1 rounded-md py-2 font-medium transition
                                ${!isValid || isLoading 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-[#2A2A72] text-white hover:bg-[#1f1f5c]'} cursor-pointer`}
                            >
                                {isLoading ? "Updating..." : "Update Incident"}
                            </button>

                            {/* Discard AI Proposal */}
                            <button 
                                type="button" 
                                className={`px-4 py-2 text-sm font-medium rounded-md transition 
                                   ${aiSuggested?'cursor-pointer bg-[#FFA400] text-white hover:bg-[#e69500]':'cursor-not-allowed bg-gray-300 text-gray-500'}`}
                                onClick={()=>{
                                    setAiSuggested(false);
                                    reset();
                                }} 
                            >
                                Discard AI proposal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Acknowledgement;

