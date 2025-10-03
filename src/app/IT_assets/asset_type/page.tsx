'use client'
import Footer from "@/components/footerComponent"
import Navbar from "@/components/navbar"
import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface AssetType {
  id: string;
  name: string;
  description: string;
  category: string;
  createdDate: string;
  assetsCount: number;
  status: 'Active' | 'Inactive';
}

export default function AssetTypeManagement() {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([
    {
      id: '1',
      name: 'Laptop',
      description: 'Portable computers for mobile use',
      category: 'Hardware',
      createdDate: '2024-01-15',
      assetsCount: 45,
      status: 'Active'
    },
    {
      id: '2',
      name: 'Server',
      description: 'Enterprise servers for data processing',
      category: 'Hardware',
      createdDate: '2024-02-20',
      assetsCount: 12,
      status: 'Active'
    },
    {
      id: '3',
      name: 'Monitor',
      description: 'Display screens for computers',
      category: 'Hardware',
      createdDate: '2024-03-10',
      assetsCount: 78,
      status: 'Active'
    },
    {
      id: '4',
      name: 'Microsoft Office',
      description: 'Productivity software suite',
      category: 'Software',
      createdDate: '2024-01-05',
      assetsCount: 156,
      status: 'Active'
    },
    {
      id: '5',
      name: 'Adobe Creative Cloud',
      description: 'Design and creativity software',
      category: 'Software',
      createdDate: '2024-02-28',
      assetsCount: 23,
      status: 'Active'
    },
    {
      id: '6',
      name: 'Desk Phone',
      description: 'Traditional office telephone',
      category: 'Hardware',
      createdDate: '2023-12-15',
      assetsCount: 8,
      status: 'Inactive'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: ''
  });

  const [newAssetType, setNewAssetType] = useState({
    name: '',
    description: '',
    category: '',
    status: 'Active'
  });

  const filteredAssetTypes = assetTypes.filter(assetType =>
    assetType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assetType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assetType.category.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(assetType =>
    (filters.category === '' || assetType.category === filters.category) &&
    (filters.status === '' || assetType.status === filters.status)
  );

  const handleCreateAssetType = () => {
    if (newAssetType.name && newAssetType.description && newAssetType.category) {
      const assetType: AssetType = {
        id: Date.now().toString(),
        name: newAssetType.name,
        description: newAssetType.description,
        category: newAssetType.category,
        createdDate: new Date().toISOString().split('T')[0],
        assetsCount: 0,
        status: newAssetType.status as 'Active' | 'Inactive'
      };
      setAssetTypes([...assetTypes, assetType]);
      setNewAssetType({ name: '', description: '', category: '', status: 'Active' });
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', status: '' });
    setSearchTerm('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-50';
      case 'Inactive': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Hardware': return 'text-blue-600 bg-blue-50';
      case 'Software': return 'text-purple-600 bg-purple-50';
      case 'Network': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className=" bg-[#EAF6FF]">
        <Navbar />
        <div className="container min-h-screen mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#232528]">Asset Type Management</h1>
                <p className="text-gray-600 text-sm">Create and manage different types of IT assets in your inventory.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Create New Asset Type Section */}
                <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-[#EAF6FF] p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Asset Type</h2>
                        <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type Name *
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Desktop Computer"
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                                value={newAssetType.name}
                                onChange={(e) => setNewAssetType({...newAssetType, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                            </label>
                            <textarea
                            placeholder="Brief description of this asset type..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                            value={newAssetType.description}
                            onChange={(e) => setNewAssetType({...newAssetType, description: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                            </label>
                            <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                            value={newAssetType.category}
                            onChange={(e) => setNewAssetType({...newAssetType, category: e.target.value})}
                            >
                                <option value="">Select category</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Software">Software</option>
                                <option value="Network">Network</option>
                                <option value="Peripheral">Peripheral</option>
                                <option value="Mobile">Mobile</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                            </label>
                            <select
                            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                            value={newAssetType.status}
                            onChange={(e) => setNewAssetType({...newAssetType, status: e.target.value})}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <button
                            onClick={handleCreateAssetType}
                            className="cursor-pointer w-full bg-[#FFA400] text-white py-2 px-4 rounded-md hover:bg-[#FFA400]/90 focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Create Asset Type
                        </button>
                    </div>
                </div>

                {/* Existing Asset Types Section */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-[#EAF6FF] p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Existing Asset Types</h2>
                    
                        <div className="relative w-full sm:w-64">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                            type="text"
                            placeholder="Search asset types..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
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
                                value={filters.category}
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                            >
                                <option value="">Category</option>
                                <option value="Hardware">Hardware</option>
                                <option value="Software">Software</option>
                                <option value="Network">Network</option>
                                <option value="Peripheral">Peripheral</option>
                                <option value="Mobile">Mobile</option>
                            </select>

                            <select
                                className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                            >
                                <option value="">Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>

                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 cursor-pointer text-sm text-gray-600 hover:text-gray-800 px-3 py-1 border border-gray-300 rounded hover:bg-white transition-colors"
                            >
                            <XMarkIcon className="w-4 h-4" />
                            Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Asset Types Table */}
                    <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Type Name</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Description</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Category</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created Date</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Assets</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredAssetTypes.map((assetType) => (
                            <tr key={assetType.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{assetType.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-600 max-w-xs">{assetType.description}</td>
                            <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(assetType.category)}`}>
                                {assetType.category}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">{assetType.createdDate}</td>
                            <td className="py-3 px-4 text-sm text-gray-600">{assetType.assetsCount}</td>
                            <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assetType.status)}`}>
                                {assetType.status}
                                </span>
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Edit
                                </button>
                                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                                    Delete
                                </button>
                                </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>

                    {filteredAssetTypes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No asset types found matching your criteria.
                    </div>
                    )}

                    {/* Summary Stats */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600 font-medium">Total Types</div>
                        <div className="text-2xl font-bold text-blue-900">{assetTypes.length}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 font-medium">Active Types</div>
                        <div className="text-2xl font-bold text-green-900">
                        {assetTypes.filter(type => type.status === 'Active').length}
                        </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-600 font-medium">Categories</div>
                        <div className="text-2xl font-bold text-purple-900">
                        {new Set(assetTypes.map(type => type.category)).size}
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
        <Footer />
    </div>
  );
}