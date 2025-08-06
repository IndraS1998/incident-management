'use client';
import { NextPage } from 'next';
import Navbar from '@/components/navbar';
import Footer from '../../../components/footer/footerComponent';



const Analytics: NextPage = () => {
  return (
    <div className="min-h-screen bg-[#EAF6FF]">
        <Navbar />
        <main className="container mx-auto p-4">
            <h1 className="text-2xl font-bold text-[#232528] mb-6">Analytics Dashboard</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-4 rounded-lg shadow border border-[#EAF6FF]">
                    <h3 className="text-sm font-medium text-[#232528] mb-1">Total Incidents</h3>
                    <p className="text-3xl font-bold text-[#2A2A72]">142</p>
                    <p className="text-xs text-[#009FFD] mt-1">↑ 12% from last month</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-[#EAF6FF]">
                    <h3 className="text-sm font-medium text-[#232528] mb-1">Avg. Resolution</h3>
                    <p className="text-3xl font-bold text-[#FFA400]">18h</p>
                    <p className="text-xs text-[#009FFD] mt-1">↓ 2h from last month</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-[#EAF6FF]">
                    <h3 className="text-sm font-medium text-[#232528] mb-1">Most Common Type</h3>
                    <p className="text-3xl font-bold text-[#009FFD]">Applicatifs</p>
                    <p className="text-xs text-[#232528] mt-1">42% of total</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-[#EAF6FF]">
                    <h3 className="text-sm font-medium text-[#232528] mb-1">High Urgency</h3>
                    <p className="text-3xl font-bold text-[#FFA400]">23</p>
                    <p className="text-xs text-[#232528] mt-1">15% of total</p>
                </div>
            </div>

            {/* Incident Volume Over Time */}
            <div className="bg-white p-6 rounded-lg shadow border border-[#EAF6FF] mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-[#232528]">Incident Volume Over Time</h2>
                    <select className="p-2 text-sm border border-[#EAF6FF] rounded">
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                        <option>This Year</option>
                    </select>
                </div>
                <div className="h-80 bg-[#EAF6FF] bg-opacity-30 rounded flex items-center justify-center">
                    <p className="text-gray-400">[Line Chart: Incident trends over selected period]</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Average Resolution Time */}
                <div className="bg-white p-6 rounded-lg shadow border border-[#EAF6FF]">
                    <h2 className="text-lg font-semibold text-[#232528] mb-4">Average Resolution Time</h2>
                    <div className="h-64 bg-[#EAF6FF] bg-opacity-30 rounded flex items-center justify-center mb-4">
                        <p className="text-gray-400">[Bar Chart: Resolution time by incident type]</p>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-[#232528]">Fastest: Réseau (8h)</span>
                        <span className="text-[#232528]">Slowest: Applicatifs (26h)</span>
                    </div>
                </div>

                {/* Incident Type Distribution */}
                <div className="bg-white p-6 rounded-lg shadow border border-[#EAF6FF]">
                    <h2 className="text-lg font-semibold text-[#232528] mb-4">Incident Type Distribution</h2>
                    <div className="h-64 bg-[#EAF6FF] bg-opacity-30 rounded flex items-center justify-center mb-4">
                        <p className="text-gray-400">[Pie Chart: Breakdown by incident type]</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-[#2A2A72] mr-2"></span>
                            <span>Matériel (32%)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-[#FFA400] mr-2"></span>
                            <span>Applicatifs (42%)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-[#009FFD] mr-2"></span>
                            <span>Réseau (18%)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-[#EAF6FF] mr-2"></span>
                            <span>Autre (8%)</span>
                        </div>
                    </div>
                </div>

                {/* Urgency Level Distribution */}
                <div className="bg-white p-6 rounded-lg shadow border border-[#EAF6FF] lg:col-span-2">
                    <h2 className="text-lg font-semibold text-[#232528] mb-4">Urgency Level Distribution</h2>
                    <div className="h-64 bg-[#EAF6FF] bg-opacity-30 rounded flex items-center justify-center mb-4">
                        <p className="text-gray-400">[Stacked Bar Chart: Urgency distribution over time]</p>
                    </div>
                    <div className="flex justify-center space-x-6 text-sm">
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-red-500 mr-2"></span>
                            <span>Critique (15%)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-[#FFA400] mr-2"></span>
                            <span>Élevé (25%)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-[#009FFD] mr-2"></span>
                            <span>Modéré (35%)</span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-3 h-3 bg-[#2A2A72] mr-2"></span>
                            <span>Faible (25%)</span>
                        </div>
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