'use client';
import React,{ useState,useEffect } from "react";
import { FilterIncidentsProps } from "@/types/management/form";
import { useForm } from "react-hook-form";
import {fetchData} from '@/lib/functions';
import { IncidentSeverity } from "@/types/management/enums";
import { alertService } from "@/lib/alert.service";

/**
 * Filter component for incident management
 * @param param0 - Props containing state setters for incidents and loading
 * @returns JSX.Element
 */

/**
 * filter criteria: severity, date, department, floor, room, building
 */

interface FilterFormData {
  severity: string;
  department: string;
  startDate: string;
  endDate: string;
}

interface Department {
  _id: string;
  department_id: string;
  name: string;
  contact: string;
  roomCount: number;
  managerCount: number;
}

const FilterIncidents : React.FC<FilterIncidentsProps> = ({setIncidents,setIsLoading}) => {
    const [isFilterDisplayed,setIsFilterDisplayed] = useState<boolean>(false);
    const [departments,setDepartments] = useState<Department[]>([]);
    const { register, handleSubmit } = useForm<FilterFormData>();

    const onSubmit = async (data: FilterFormData) => {
        setIsLoading(true);
        try{
            const res = await fetch(`/api/incidents/filter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({data}),
            });
            if (!res.ok) alertService.error("Failed to update incident");
            alertService.success('Successfully Updated Incident');
            const digest = await res.json();
            console.log(digest.data);
        }catch(error){
            console.log(error)
        }finally{
            setIsLoading(false);
        }
    };

    const init = async () =>{
        const resp = await fetchData('/api/departments',setIsLoading);
        if(resp) setDepartments(resp);
    }

    useEffect(() =>{
        init();
    },[])

    return(
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border border-[#EAF6FF]">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#232528]">Filter Pending Incidents</h2>
                <button onClick={() => setIsFilterDisplayed(!isFilterDisplayed)} 
                className="text-sm text-[#232528] hover:text-[#FFA400] focus:outline-none cursor-pointer"
                >
                {isFilterDisplayed ? (
                    <span className="flex items-center">
                    Hide filter
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                    </span>
                ) :(
                    <span className="flex items-center">
                    Show filter
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    </span>
                )}
                </button>
            </div>

            {isFilterDisplayed && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* First Row - Basic Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        {/* Severity Filter */}
                        <div>
                            <label
                                htmlFor="severity"
                                className="block text-sm font-semibold text-gray-700 tracking-wide"
                            >
                                Severity
                            </label>
                            <select
                                id="severity"
                                {...register("severity")}
                                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 shadow-sm transition duration-200 focus:border-[#FFA400] focus:ring-2 focus:ring-[#FFA400] focus:outline-none"
                            >
                                <option value="">None</option>
                                <option value="">All</option>
                                <option value={IncidentSeverity.CRITICAL} className="text-red-600 font-semibold">
                                    {IncidentSeverity.CRITICAL}
                                </option>
                                <option value={IncidentSeverity.HIGH} className="text-orange-600 font-medium">
                                    {IncidentSeverity.HIGH}
                                </option>
                                <option value={IncidentSeverity.MEDIUM} className="text-yellow-600">
                                    {IncidentSeverity.MEDIUM}
                                </option>
                                <option value={IncidentSeverity.LOW} className="text-green-600">
                                    {IncidentSeverity.LOW}
                                </option>
                            </select>
                        </div>
                        {/* Department Filter */}
                        <div>
                            <label htmlFor="department" className="block text-sm font-medium text-[#232528] mb-1">
                                Department
                            </label>
                            <select
                                id="department"
                                {...register("department")}
                                className="w-full p-2 border border-[#EAF6FF] text-sm rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                            >
                                <option value="">All Departments</option>
                                {departments.map((dept) => (
                                    <option key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-[#232528] mb-1">
                                Start Date
                            </label>
                            <input
                                id="startDate"
                                type="date"
                                {...register("startDate")}
                                className="w-full p-2 text-sm border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-[#232528] mb-1">
                                End Date
                            </label>
                            <input
                                id="endDate"
                                type="date"
                                {...register("endDate")}
                                className="w-full p-2 text-sm border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                            />
                        </div>
                    </div>
                    {/* Submit Button */}
                    <div className="flex justify-start mt-6">
                        <button type="submit" className="bg-[#FFA400] text-white text-sm px-4 py-2 rounded-xs hover:bg-[#E59400] transition-colors cursor-pointer">
                            Search
                        </button>
                    </div>
                </form>
            )}
            </div>
    )
}

export default FilterIncidents;