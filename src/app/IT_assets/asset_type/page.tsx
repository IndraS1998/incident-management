'use client'
import Footer from "@/components/footerComponent"
import Navbar from "@/components/navbar"
import { useState,useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useForm } from "react-hook-form";
import { alertService } from "@/lib/alert.service";
import PageLoader from "@/components/loaders/pageLoaders";
import { fetchData } from "@/lib/functions";
import Pagination from "@/components/Pagination/file";

interface AssetType {
  _id: string;
  name: string;
  description: string;
}

interface AssetTypeForm{
  name: string;
  description: string;
}

export default function AssetTypeManagement() {
  const {register, handleSubmit,reset, formState: {errors}} = useForm<AssetTypeForm>()
  const [loading,setLoading] = useState<boolean>(false)
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [page,setPage] = useState<number>(1)

  async function fetchAssetTypes(){
    const data = await fetchData('/api/assets/types',setLoading);
    setAssetTypes(data)
  }

  useEffect(()=>{
    fetchAssetTypes();
  },[])

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    description: ''
  });

  const filteredAssetTypes = assetTypes.filter(assetType =>
    assetType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assetType.description.toLowerCase().includes(searchTerm.toLowerCase()) 
  ).filter(assetType =>
    (filters.name === '' || assetType.name === filters.name) &&
    (filters.description === '' || assetType.description === filters.description)
  );

  const clearFilters = () => {
    setFilters({ name: '', description: '' });
    setSearchTerm('');
    fetchAssetTypes();
  };

  return (
    <div className="bg-[#F6F6F8] ">
      {loading && <PageLoader />}
      <Navbar />
      <div className="container min-h-[74vh] mx-auto mb-2 p-4">
          <div className="mb-8">
            <p className="text-2xl font-bold text-[#232528]">Asset Type Management</p>
            <p className="text-gray-600 text-sm">Create and manage different types of IT assets in your inventory.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Create New Asset Type Section */}
            <form onSubmit={handleSubmit(async (data)=>{
              setLoading(true)
              try{
                const res = await fetch('/api/assets/types', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(data)
                })
                if(!res.ok) throw new Error('Failed to create asset type')
                await fetchAssetTypes()
                alertService.success("Asset type created successfully.")
                reset()
              }catch(err){
                console.log(err)
                alertService.error("Failed to create asset type. Please try again.")
              }finally{
                setLoading(false)
              }
            })} className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-[#F6F6F8] p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Asset Type</h2>
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Scanner, Desktop"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                      {...register("name", {required: true})}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      placeholder="Brief description of this asset type..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:border-transparent"
                      {...register("description", {required: true})}  
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <button type="submit"
                  className="cursor-pointer w-full bg-[#FFA400] text-white py-2 px-4 rounded-md hover:bg-[#FFA400]/90 focus:outline-none focus:ring-2 focus:ring-[#FFA400] focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                >
                    <PlusIcon className="w-4 h-4" />
                    Create Asset Type
                </button>
              </div>
            </form>

            {/* Existing Asset Types Section */}
            <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-[#F6F6F8] p-6">
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 p-4 bg-[#f5faff] rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <FunnelIcon className="w-4 h-4" />
                        <span>Filter by:</span>
                    </div>
                
                    <div className="flex flex-wrap gap-3">
                        <select
                            className="text-sm border border-gray-200 rounded px-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#FFA400]"
                            value={filters.name}
                            onChange={(e) => setFilters({...filters, name: e.target.value})}
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
                            value={filters.description}
                            onChange={(e) => setFilters({...filters, description: e.target.value})}
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Created Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Assets</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAssetTypes.slice((page - 1) * 5, page * 5).map((assetType) => (
                        <tr key={assetType._id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{assetType.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 max-w-xs capitalize">{assetType.description}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">date</td>
                          <td className="py-3 px-4 text-sm text-gray-600">2</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button className="text-blue-800 hover:text-[#232528] text-sm font-medium cursor-pointer">
                                Details
                              </button>
                              <button className="text-[#FFA400] hover:text-[#FFA400]/80 text-sm font-medium cursor-pointer">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination currentPage={page} totalPages={Math.ceil(assetTypes.length/5)} onPageChange={setPage}/>
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
                     2
                    </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-600 font-medium">Categories</div>
                    <div className="text-2xl font-bold text-purple-900">
                     2
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