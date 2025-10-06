'use client';
import { NextPage } from 'next';
import {useState, useEffect} from 'react';
import Navbar from '@/components/navbar';
import Footer from '../../../components/footer/footerComponent';
import Skeleton from '@/components/skeleton';
import { useForm } from "react-hook-form";
import { fetchData } from '@/lib/functions';
import {
  LineChart,Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,BarChart,Bar, PieChart, Pie, Cell, Legend,
} from "recharts";

interface Metrics {
    incidentsThisMonth: number;
    incidentsLastMonth: number;
    averageResolutionTime: number;
    averageResolutionTimePreviousMonth: number;
    mostCommonIncidentType: string;
    mostCommonIncidentPercentage: number;
    highUrgencyIncidents: number;
    incidentsChangeTendency:number;
    incidentsChangePercentile:number;
    resolutionTimeChangeTendency:number;
}

interface IncidentVolumeDataType {
  date: string;
  incidents: number;
};

interface IncidentVolumeFormValues {
  period: string;
};

interface ResolutionTimeData{
  incidentType: string;
  avgResolutionTime: number; // in hours
}

interface IncidentPercentage{
    incidentType: string;
    percentage: number;
}

const getTrendDirection = (tendency: number): string => {
  if (tendency > 0) return '↑';
  if (tendency < 0) return '↓';
  return '→'; // neutral trend if equal
};

const COLORS = ["#FFA400", "#009FFD", "#2A2A72", "#F15BB5", "#232528"]

interface SeverityPoint{
  date: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
};

const Analytics: NextPage = () => {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [isMetricsLoading,setMetricsIsLoading] = useState<boolean>(false);
    const [isIncidentVolumeLoading,setIncidentVolumeIsLoading] = useState<boolean>(false);
    const [resolutionTime, setResolutionTime] = useState<ResolutionTimeData[]>([]);
    const [incidentPercentages, setIncidentPercentages] = useState<IncidentPercentage[]>([]);
    const [severityPoints,setSeverityPoints] = useState<SeverityPoint[]>([])


    const { register, watch } = useForm<IncidentVolumeFormValues>({
        defaultValues: { period: "30d" },
        mode: "onChange",
    });

    const incidentVolumePeriod = watch("period");
    const [incidentVolumeData, setIncidentVolumeData] = useState<IncidentVolumeDataType[]>([]);

    async function getMetrics(){
        const data = await fetchData('/api/dashboard/metrics',setMetricsIsLoading)
        if(data){
            setMetrics(data)
        }
    }

    async function getIncidentVolumeData(){
        const response= await fetchData(`/api/dashboard/incidentVolume?period=${incidentVolumePeriod}`,setIncidentVolumeIsLoading)
        if(response){
            setIncidentVolumeData(response.data)
        }
    }

    async function getResolutionTimeByIncident(){
        const response = await fetchData(`/api/dashboard/resolutionTime?period=${incidentVolumePeriod}`, setIncidentVolumeIsLoading);
        if(response){
            setResolutionTime(response)
        }
    }

    async function getIncidentTypePercentage(){
        const response = await fetchData(`/api/dashboard/incidentTypePercentage?period=${incidentVolumePeriod}`,setIncidentVolumeIsLoading)
        if(response){
            setIncidentPercentages(response)
        }
    }

    async function getUrgencyDistribution(){
        const response = await fetchData(`/api/dashboard/urgencyDistribution?period=${incidentVolumePeriod}`,setIncidentVolumeIsLoading)
        if(response){
            setSeverityPoints(response.data)
        }
    }

    useEffect(() => {
        getMetrics();
    }, []);

    useEffect(()=>{
        getIncidentVolumeData()
        getResolutionTimeByIncident()
        getIncidentTypePercentage()
        getUrgencyDistribution();
    },[incidentVolumePeriod])

    

    return (
        <div className="min-h-screen bg-[#F6F6F8]">
            <Navbar />
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold text-[#232528] mb-6">Analytics Dashboard</h1>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow border border-[#F6F6F8]">
                        <h3 className="text-sm font-medium text-[#232528] mb-1">Total Incidents</h3>
                        {isMetricsLoading?(
                            <>
                                <Skeleton className="h-8 w-20 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </>
                        ):(
                            <>
                                <p className="text-3xl font-bold text-[#2A2A72]">{metrics?.incidentsThisMonth}</p>
                                <p className={`text-xs ${metrics && (metrics.incidentsChangeTendency < 0) ? 'text-[#009FFD]' : 'text-[#FF4D4F]'} mt-1`}>
                                    {metrics && getTrendDirection(metrics.incidentsChangeTendency)}
                                    {metrics && metrics.incidentsChangePercentile.toFixed(2)} % from last month
                                </p>
                            </>
                        )}
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border border-[#F6F6F8]">
                        <h3 className="text-sm font-medium text-[#232528] mb-1">Avgerage Resolution</h3>
                        {isMetricsLoading?(
                            <>
                                <Skeleton className="h-8 w-20 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </>
                        ):(
                            <>
                                <p className="text-3xl font-bold text-[#FFA400]">{metrics?.averageResolutionTime} h</p>
                                <p className={`text-xs ${metrics && (metrics.resolutionTimeChangeTendency < 0)? 'text-[#009FFD]' : 'text-[#FF4D4F]'} mt-1`}>
                                    {metrics && getTrendDirection(metrics.resolutionTimeChangeTendency)}
                                    {metrics && Math.abs(metrics.resolutionTimeChangeTendency).toFixed(2)} h from last month
                                </p>
                            </>
                        )}
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border border-[#F6F6F8]">
                        <h3 className="text-sm font-medium text-[#232528] mb-1">Most Common Type</h3>
                        {isMetricsLoading?(
                            <>
                                <Skeleton className="h-8 w-20 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </>
                        ):(
                            <>
                                <p className="text-3xl font-bold text-[#009FFD] capitalize">{metrics?.mostCommonIncidentType}</p>
                                <p className="text-xs text-[#232528] mt-1">{metrics?.mostCommonIncidentPercentage}% of total</p>
                            </>
                        )}
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow border border-[#F6F6F8]">
                        <h3 className="text-sm font-medium text-[#232528] mb-1">High Urgency</h3>
                        {isMetricsLoading?(
                            <>
                                <Skeleton className="h-8 w-20 mb-2" />
                                <Skeleton className="h-4 w-32" />
                            </>
                        ):(
                            <>
                                <p className="text-3xl font-bold text-[#FFA400]">{metrics?.highUrgencyIncidents}</p>
                                <p className="text-xs text-[#232528] mt-1">
                                    {metrics && ((metrics.highUrgencyIncidents / metrics.incidentsThisMonth) * 100).toFixed(2)} % of total incidents reported this month
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Incident Volume Over Time */}
                <div className="bg-white p-6 rounded-lg shadow border border-[#F6F6F8] mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-[#232528]">Incident Volume Over Time</h2>
                        <form>
                            <select
                                {...register("period")}
                                className="p-2 text-sm border border-[#F6F6F8] rounded cursor-pointer"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="1y">Last 1 Year</option>
                            </select>
                        </form>
                    </div>
                    <div className="h-80 bg-[#F6F6F8] bg-opacity-30 rounded flex items-center justify-center">
                        {
                            isIncidentVolumeLoading?<p className="text-gray-400">[Line Chart: Incident trends over selected period]</p>:
                            (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={incidentVolumeData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                        type="monotone"
                                        dataKey="incidents"
                                        stroke="#009FFD"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )
                        }
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Average Resolution Time */}
                    <div className="bg-white p-6 rounded-lg shadow border border-[#F6F6F8]">
                        <h2 className="text-lg font-semibold text-[#232528] mb-4">Average Resolution Time</h2>
                        <div className="h-64 bg-[#F6F6F8] bg-opacity-30 rounded flex items-center justify-center mb-4">
                            {isIncidentVolumeLoading?
                            <p className="text-gray-400">[Bar Chart: Resolution time by incident type]</p>:(
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={resolutionTime}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="incidentType"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(val) => val.replace("_", " ")}
                                    />
                                    <YAxis
                                        label={{
                                        value: "Hours",
                                        angle: -90,
                                        position: "insideLeft",
                                        offset: 0,
                                        style: { textAnchor: "middle", fontSize: 12 },
                                        }}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="avgResolutionTime"
                                        fill="#2A2A72"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-[#232528]">Fastest: {resolutionTime[0]?.incidentType} ({resolutionTime[0]?.avgResolutionTime}h)</span>
                            <span className="text-[#232528]">Slowest: {resolutionTime[resolutionTime.length - 1]?.incidentType} ({resolutionTime[resolutionTime.length - 1]?.avgResolutionTime}h)</span>
                        </div>
                    </div>

                    {/* Incident Type Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow border border-[#F6F6F8]">
                        <h2 className="text-lg font-semibold text-[#232528] mb-4">Incident Type Distribution</h2>
                        <div className="h-64 bg-[#F6F6F8] bg-opacity-30 rounded flex items-center justify-center mb-4">
                            {isIncidentVolumeLoading?<p className="text-gray-400">[Pie Chart: Breakdown by incident type]</p>:
                            (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={incidentPercentages}
                                            dataKey="percentage"
                                            nameKey="incidentType"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            label
                                        >
                                        {incidentPercentages.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-4">
                            {incidentPercentages.map((item, index) => (
                            <div key={item.incidentType} className="flex items-center">
                                <span
                                 className="w-3 h-3 mr-2 rounded-sm"
                                 style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></span>
                                <span className='capitalize'>
                                 {item.incidentType} ({item.percentage}%)
                                </span>
                            </div>
                            ))}
                        </div>
                    </div>

                    {/* Urgency Level Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow border border-[#F6F6F8] lg:col-span-2">
                        <h2 className="text-lg font-semibold text-[#232528] mb-4">Urgency Level Distribution</h2>
                        <div className="h-64 bg-[#F6F6F8] bg-opacity-30 rounded flex items-center justify-center mb-4">
                            {
                                isIncidentVolumeLoading?<p className="text-gray-400">[Stacked Bar Chart: Urgency distribution over time]</p>:
                                (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={severityPoints}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="critical" stackId="a" fill="#e76f51" /> {/* red for critical */}
                                        <Bar dataKey="high"     stackId="a" fill="#f4a261" /> {/* secondary */}
                                        <Bar dataKey="medium"   stackId="a" fill="#e9c46a" /> {/* accent */}
                                        <Bar dataKey="low"      stackId="a" fill="#2a9d8f" /> {/* primary */}
                                        </BarChart>
                                    </ResponsiveContainer>
                                )
                            }
                        </div>
                    </div>
                </div>

                {/* Export Section */}
                <div className="mt-8 flex justify-end">
                    <button className="px-4 py-2 cursor-pointer bg-[#2A2A72] text-white rounded hover:bg-[#3A3A82] transition-colors flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export Report
                    </button>
                </div>
            </main>
            <Footer />
        </div>
    )};

export default Analytics;