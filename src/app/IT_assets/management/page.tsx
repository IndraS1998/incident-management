'use client'
import Footer from "@/components/footerComponent";
import Navbar from "@/components/navbar";
import { useState } from "react";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Asset {
  id: string;
  name: string;
  type: string;
  serialNumber: string;
  location: string;
  age: string;
  maintenance: string;
}

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: '1',
      name: 'Laptop - Engineering',
      type: 'Laptop',
      serialNumber: 'SN12345',
      location: 'Office - Floor 3',
      age: '1 year',
      maintenance: 'Due soon'
    },
    {
      id: '2',
      name: 'Server - Database',
      type: 'Server',
      serialNumber: 'SV67890',
      location: 'Data Center - Rack A',
      age: '3 years',
      maintenance: 'Overdue'
    },
    {
      id: '3',
      name: 'Desktop - Design',
      type: 'Desktop',
      serialNumber: 'DS24680',
      location: 'Office - Floor 2',
      age: '6 months',
      maintenance: 'Up to date'
    },
    {
      id: '4',
      name: 'Network Switch',
      type: 'Switch',
      serialNumber: 'NS13579',
      location: 'Network Room',
      age: '2 years',
      maintenance: 'Up to date'
    },
    {
      id: '5',
      name: 'Printer - Office',
      type: 'Printer',
      serialNumber: 'PR98765',
      location: 'Office - Floor 1',
      age: '4 years',
      maintenance: 'Overdue'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    age: '',
    maintenance: ''
  });

  const [newAsset, setNewAsset] = useState({
    name: '',
    type: '',
    serialNumber: '',
    location: ''
  });

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.location.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(asset =>
    (filters.type === '' || asset.type === filters.type) &&
    (filters.age === '' || asset.age === filters.age) &&
    (filters.maintenance === '' || asset.maintenance === filters.maintenance)
  );

  const handleCreateAsset = () => {
    if (newAsset.name && newAsset.type && newAsset.serialNumber && newAsset.location) {
      const asset: Asset = {
        id: Date.now().toString(),
        name: newAsset.name,
        type: newAsset.type,
        serialNumber: newAsset.serialNumber,
        location: newAsset.location,
        age: '0 days',
        maintenance: 'Up to date'
      };
      setAssets([...assets, asset]);
      setNewAsset({ name: '', type: '', serialNumber: '', location: '' });
    }
  };

  const clearFilters = () => {
    setFilters({ type: '', age: '', maintenance: '' });
    setSearchTerm('');
  };

  const getMaintenanceColor = (status: string) => {
    switch (status) {
      case 'Overdue': return 'text-red-600 bg-red-50';
      case 'Due soon': return 'text-yellow-600 bg-yellow-50';
      case 'Up to date': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-[#EAF6FF]">
        <Navbar />
        <div className="container mx-auto p-4 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#232528] ">Asset Management</h1>
                <p className="text-gray-600 text-sm">Create, view, and manage your IT assets.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Create New Asset Section */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-[#EAF6FF] p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Asset</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Asset Name
                            </label>
                            <input
                            type="text"
                            placeholder="e.g., MacBook Pro 16"
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                            value={newAsset.name}
                            onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Asset Type
                            </label>
                            <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                            value={newAsset.type}
                            onChange={(e) => setNewAsset({...newAsset, type: e.target.value})}
                            >
                            <option value="">Select type</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Desktop">Desktop</option>
                            <option value="Server">Server</option>
                            <option value="Printer">Printer</option>
                            <option value="Switch">Switch</option>
                            <option value="Router">Router</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Serial Number
                            </label>
                            <input
                            type="text"
                            placeholder="e.g., C02C8R2JLV22"
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                            value={newAsset.serialNumber}
                            onChange={(e) => setNewAsset({...newAsset, serialNumber: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                            </label>
                            <input
                            type="text"
                            placeholder="e.g., Building A, Floor 2"
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                            value={newAsset.location}
                            onChange={(e) => setNewAsset({...newAsset, location: e.target.value})}
                            />
                        </div>

                    <button onClick={handleCreateAsset}
                        className="w-full cursor-pointer  bg-[#FFA400] text-white py-2 px-4 rounded-md hover:bg-[#FFA400]/90 focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:ring-offset-2 transition-colors"
                    >
                        Create Asset
                    </button>
                    </div>
                </div>

                {/* Existing Assets Section */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-[#EAF6FF] p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Existing Assets</h2>
                    
                        <div className="relative w-full sm:w-64">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                            type="text"
                            placeholder="Search assets..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 bg-[#f2f8fd] rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FunnelIcon className="w-4 h-4" />
                            <span>Filter by:</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                            <select
                            className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                            value={filters.type}
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                            >
                                <option value="">Type</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Desktop">Desktop</option>
                                <option value="Server">Server</option>
                                <option value="Printer">Printer</option>
                                <option value="Switch">Switch</option>
                            </select>

                            <select
                            className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                            value={filters.age}
                            onChange={(e) => setFilters({...filters, age: e.target.value})}
                            >
                                <option value="">Age</option>
                                <option value="6 months">6 months</option>
                                <option value="1 year">1 year</option>
                                <option value="2 years">2 years</option>
                                <option value="3 years">3 years</option>
                                <option value="4 years">4 years</option>
                            </select>

                            <select
                            className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                            value={filters.maintenance}
                            onChange={(e) => setFilters({...filters, maintenance: e.target.value})}
                            >
                                <option value="">Maintenance</option>
                                <option value="Up to date">Up to date</option>
                                <option value="Due soon">Due soon</option>
                                <option value="Overdue">Overdue</option>
                            </select>

                            <button onClick={clearFilters}
                            className="cursor-pointer flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors"
                            >
                                <XMarkIcon className="w-4 h-4" />
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Assets Table */}
                    <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Asset Name</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Serial No.</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Location</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Age</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Maintenance</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredAssets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{asset.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{asset.type}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{asset.serialNumber}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{asset.location}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{asset.age}</td>
                            <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMaintenanceColor(asset.maintenance)}`}>
                                {asset.maintenance}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                💤
                                </button>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>

                    {filteredAssets.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No assets found matching your criteria.
                    </div>
                    )}
                </div>
            </div>
        </div>
        <Footer />
    </div>
  );
}