'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState,useCallback } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footerComponent';
import PageLoader from '@/components/loaders/pageLoaders';
import { 
  CogIcon, 
  MapPinIcon, 
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link';
import { fetchData } from '@/lib/functions';

interface Location {
  building: string;
  department: string;
  floor: number;
  room_number: number;
}

enum AssetState {
  IN_STOCK = 'in_stock',
  IN_USE = 'in_use',
  RETIRED = 'retired',
  HAS_ISSUES = 'has_issues',
  UNDER_MAINTENANCE = 'under_maintenance',
}

interface Asset {
  _id: string;
  asset_id: string;
  asset_type: string;
  criticality: string;
  model_number: string;
  lifespan: number;
  location: Location | null;
  state: AssetState;
  age: string;
  maintenance_frequency: number;
  date_in_production: string;
}

const maintenanceHistory = [
  {
    date: '2023-05-15',
    type: 'Preventive',
    performedBy: 'Tech Support Team',
    notes: 'Annual checkup and cleaning'
  },
  {
    date: '2023-11-20',
    type: 'Repair',
    performedBy: 'Tech Support Team',
    notes: 'Replaced faulty hard drive'
  },
  {
    date: '2024-05-15',
    type: 'Preventive',
    performedBy: 'Tech Support Team',
    notes: 'Annual checkup and cleaning'
  }
];

const stateHistory = [
  {
    date: '2022-05-15',
    state: 'Active',
    changedBy: 'System Admin',
    reason: 'Asset deployed'
  },
  {
    date: '2023-11-20',
    state: 'Active',
    changedBy: 'Tech Support Team',
    reason: 'Asset repaired and reactivated'
  }
];


export default function AssetDetailsClient() {
  const { id } = useParams();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  //const [maintenancePage, setMaintenancePage] = useState(1);
  //const [statePage, setStatePage] = useState(1);

  const fetchAssetDetails = useCallback(async () => {
    const data = await fetchData(`/api/assets/${id}`, setLoading);
    setAsset(data);
  }, [id, setLoading]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails])

  // Format location string from location object
  const formatLocation = (location: Location | null): string => {
    if (!location) return 'Not assigned';
    return `${location.department} / ${location.building} / ${location.floor}${getOrdinalSuffix(location.floor)} Floor / Room ${location.room_number}`;
  };

  function getAge(dateString: string): number {
    const now = new Date();
    const date = new Date(dateString);
    let age = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }

  function getLifeLeft(dateString: string, lifespan: number): string {
    if(dateString){
      const age = getAge(dateString);
      if(lifespan - age < 0) return 'Expired'
      return `${lifespan - age} years`;
    }else{
      return 'N/A'
    } 
  }

  // Helper function for ordinal suffixes
  const getOrdinalSuffix = (num: number): string => {
    if (num % 100 >= 11 && num % 100 <= 13) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const getCriticalityColor = (status: string) => {
    if (status === 'high') {
      return 'text-red-600';
    } else if (status === 'medium') {
      return 'text-yellow-600';
    } else if (status === 'low') {
      return 'text-blue-600';
    } else {
      return 'text-gray-600';
    }
  };

  const getStateBadgeColor = (state: AssetState) => {
    switch (state) {
      case AssetState.IN_USE:
        return 'bg-green-100 text-green-800';
      case AssetState.IN_STOCK:
        return 'bg-gray-100 text-gray-800';
      case AssetState.UNDER_MAINTENANCE:
        return 'bg-yellow-100 text-yellow-800';
      case AssetState.RETIRED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  const getLifeLeftColor = (lifeLeft:string) => {
    if (lifeLeft === 'Expired') {
      return 'text-red-600 bg-red-50';
    } else if (lifeLeft === '1 years' || lifeLeft === '0 years') {
      return 'text-yellow-600 bg-yellow-50';
    } else if (lifeLeft === '2 years' || lifeLeft === '3 years') {
      return 'text-green-600 bg-green-50';
    } else {
      return 'text-gray-600 bg-gray-50';
    }
  } 

  return (
    <div className="bg-[#F6F6F8]">
        {loading && <PageLoader />}
        <Navbar />
        <div className="container mx-auto p-4 min-h-[84vh]">
            {/* Header */}
            <div className="mb-4 mt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                        <Link href='/IT_assets/management' className="inline-flex items-center text-[#232528] hover:text-[#232528]/80 text-sm font-medium cursor-pointer">
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Assets
                        </Link>
                        <h1 className="mt-2 text-2xl font-bold text-gray-900">Asset Details</h1>
                        <p className="text-gray-600 mt-2">
                            Comprehensive information for Asset {asset?.asset_id}.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {/* Change Asset State Button */}
                    <button
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-[#2A2A72] bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        <CogIcon className="h-4 w-4 mr-2" />
                        Change Asset State
                    </button>

                    {/* Perform Location Change Button */}
                    <button
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-[#2A2A72] bg-white hover:bg-gray-50 focus:outline-none"
                    >
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        Perform Location Change
                    </button>

                    {/* Perform Maintenance Button */}
                    <button
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-[#F6F6F8] bg-[#009FFD] hover:bg-[#009FFD]/80 focus:outline-none"
                    >
                        <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
                        Perform Maintenance
                    </button>
                    </div>
                </div>
            </div>
            {/* Asset Information Section */}
            <div className="bg-white shadow rounded-lg mb-4">
                <div className="px-6 pt-4">
                    <h2 className="text-lg font-semibold text-gray-900">Asset Information</h2>
                </div>
                <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Asset ID</label>
                                <p className="mt-1 text-sm text-gray-900">{asset?.asset_id}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Model Number</label>
                                <p className="mt-1 text-sm text-gray-900">{asset?.model_number}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Age</label>
                                <p className="mt-1 text-sm text-gray-900">{asset?.age}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Location</label>
                                <p className="mt-1 text-sm text-gray-900">{formatLocation(asset?.location ?? null)}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Asset Type</label>
                                <p className="mt-1 text-sm text-gray-900">{asset?.asset_type}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Lifespan</label>
                                <p className="mt-1 text-sm text-gray-900">{asset?.lifespan} years</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Life left</label>
                                <span  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLifeLeftColor(getLifeLeft(asset?.date_in_production ?? '', asset?.lifespan ?? 0))}`}>
                                    {getLifeLeft(asset?.date_in_production ?? '', asset?.lifespan ?? 0)}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Maintenance Frequency</label>
                                <p className="mt-1 text-sm text-gray-900">Every {asset?.maintenance_frequency} months</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Criticality</label>
                                <p className={`mt-1 block text-sm font-medium ${getCriticalityColor(asset?.criticality ?? '')}`}>{asset?.criticality}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">State</label>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStateBadgeColor(asset?.state ?? AssetState.IN_STOCK)}`}>
                                    {asset?.state}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Deployment Date</label>
                                <p className="mt-1 text-sm text-gray-900">{new Date(asset?.date_in_production ?? '').toDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Maintenance History Section */}
            <div className="my-4">
                <div className='my-4 flex items-center justify-between'>
                    <h2 className="text-lg font-semibold text-gray-900">Maintenance History</h2>
                    <button className='cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium text-[#323d48]'>
                        <ArrowDownTrayIcon className="h-4 w-4 mr-3"/>
                        Download
                    </button>
                </div>
                <div className="overflow-x-auto bg-white border border-gray-100 shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#F6F6F8]">
                            <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                DATE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                TYPE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                PERFORMED BY
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                NOTES
                            </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {maintenanceHistory.map((record, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {record.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {record.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {record.performedBy}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                    {record.notes}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pt-3">
                    <p className="text-sm text-gray-700">
                    Showing 1 to {maintenanceHistory.length} of 15 results
                    </p>
                </div>
            </div>

            {/* State History Section */}
            <div className="my-4">
                <div className='my-4 flex items-center justify-between'>
                    <h2 className="text-lg font-semibold text-gray-900">State History</h2>
                    <button className='cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium text-[#323d48]'>
                        <ArrowDownTrayIcon className="h-4 w-4 mr-3"/>
                        Download
                    </button>
                </div>
                <div className="overflow-x-auto bg-white border border-gray-100 shadow rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#F6F6F8]">
                            <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                DATE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                STATE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                CHANGED BY
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                REASON
                            </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stateHistory.map((record, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.state}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {record.changedBy}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                {record.reason}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="pt-3">
                    <p className="text-sm text-gray-700">
                    Showing 1 to {stateHistory.length} of 2 results
                    </p>
                </div>
            </div>
        </div>
        <Footer />
    </div>
  );
}
