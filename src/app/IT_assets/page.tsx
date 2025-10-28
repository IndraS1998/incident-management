'use client';
import React,{useState,useEffect} from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Calendar } from "lucide-react";
import Footer from "@/components/footerComponent";
import Navbar from "@/components/navbar";
import { fetchData } from "@/lib/functions";
import PageLoader from "@/components/loaders/pageLoaders";

interface DashboardOverviewResponse {
  summary: SummaryOverview[];
  charts: {
    assetsByState: AssetStateItem[];                  // Pie chart data
    assetAgeDistribution: AssetAgeDistributionItem[]; // Histogram data
    assetsByDepartment: DepartmentAssetItem[];        // Bar chart data
    maintenanceFrequency: DepartmentMaintenanceItem[];// Maintenance frequency per dept
  };
}

// -----------------------------
// Chart Data Sub-Interfaces
// -----------------------------
interface SummaryOverview{
    label:string;
    value:string;
    change:string;
    positive:boolean;
}

interface AssetStateItem {
  label: string;  // e.g. "active", "in_repair", "in_storage"
  count: number;  // number of assets in this state
  color: string;
}

interface AssetAgeDistributionItem {
  range: string;  // e.g. "0-1y", "1-2y", "2-3y", ...
  count: number;  // number of assets in this age range
}

interface DepartmentAssetItem {
  department: string; // e.g. "Finance", "HR"
  count: number;      // number of assets in this department
}

interface DepartmentMaintenanceItem {
  department: string;   // e.g. "Engineering", "Sales"
  averageDays: number;  // average maintenance frequency (in days)
}

export default function ITAssetDashboard(){
    const [overviewData,setOverviewData] = useState<DashboardOverviewResponse | null>(null);
    const [loading,setLoading] = useState(false);

    async function fetchAssetsOverview(){
        const response = await fetchData('/api/assets/overview',setLoading);
        if(response){
            setOverviewData(response)
        }
        console.log(response)
    }

    useEffect(()=>{
        fetchAssetsOverview();
    },[])

    return (
        <div className='min-h-screen bg-[#F6F6F8]'>
            {loading && <PageLoader />}
            <Navbar />
            <div className="container mx-auto p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#232528]">Asset Management Overview</h1>
                        <p className="text-gray-500">A comprehensive overview of IT asset health and maintenance status.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-white shadow px-4 py-2 rounded-md text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Last 30 Days
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {overviewData?.summary.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl shadow p-4">
                        <p className="text-gray-500 text-sm">{stat.label}</p>
                        <h2 className="text-2xl font-bold text-[#2A2A72]">{stat.value}</h2>
                        <p className={`text-sm ${stat.positive ? "text-green-600" : "text-red-600"}`}>{stat.change}</p>
                    </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Pie Chart */}
                    <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
                        <h3 className="font-semibold mb-2 text-[#2A2A72]">Assets by State</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={overviewData?.charts.assetsByState}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    dataKey="count"
                                >
                                    {overviewData?.charts.assetsByState.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center flex-wrap gap-3 mt-2 text-sm">
                            {overviewData?.charts.assetsByState.map((d) => (
                                <div key={d.label} className="flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                                    {d.label.split('_').join(' ')} ({d.count})
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="bg-white p-4 rounded-xl shadow flex flex-col items-center">
                        <h3 className="font-semibold mb-2 text-[#2A2A72]">Asset Age Distribution</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={overviewData?.charts.assetAgeDistribution}>
                            <XAxis dataKey="range" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Maintenance Frequency */}
                    <div className="bg-white p-4 rounded-xl shadow">
                        <h3 className="font-semibold mb-2 text-[#2A2A72]">Average Maintenance Frequency</h3>
                        <ul className="text-sm divide-y">
                            {overviewData?.charts.maintenanceFrequency.filter(m => m.averageDays !== null).map((m) => (
                            <li key={m.department} className="flex justify-between py-2">
                                <span>{m.department}</span>
                                 <span className="font-medium text-gray-700">{m.averageDays} days</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Department Distribution */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="font-semibold mb-4 text-[#2A2A72]">Asset Distribution by Department</h3>
                    <div className="space-y-3">
                    {overviewData?.charts.assetsByDepartment.filter(d => d.count > 0).map((d) => (
                        <div key={d.department}>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>{d.department} ({d.count})</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full">
                                <div className="h-2 rounded-full bg-[#2A2A72]" style={{ width: `${d.count}%` }}></div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}