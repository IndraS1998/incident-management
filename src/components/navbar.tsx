import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { fetchData } from '@/lib/functions';
import { 
  Cog6ToothIcon, ArrowLeftOnRectangleIcon, ChevronDownIcon ,BuildingOffice2Icon,Bars3Icon, XMarkIcon, CpuChipIcon
} from '@heroicons/react/24/outline';
import { UserCircleIcon,Squares2X2Icon,WrenchIcon,ComputerDesktopIcon } from '@heroicons/react/24/solid';
import { Transition } from "@headlessui/react";
import Image from 'next/image';


// Interfaces
enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

enum AdminRole {
  SUPERADMIN = 'superadmin',
  DEPARTMENT_ADMIN = 'incident_manager',
}

interface IAdmin {
    _id:string;
    admin_id: string; // Unique identifier for the admin composed of first letter of first name and lastname
    name: string;
    email: string;
    phone: string;
    password_hash: string;
    status: AdminStatus;
    role: AdminRole;
}

export default function Navbar(){
    const pathname = usePathname();
    const r = useRouter()

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isContentManagementOpen,setIsContentManagenentOpen] = useState(false)
    const [contentMobileMode,setContentMobileMode] = useState(false)
    const [isAssetManagementOpen,setIsAssetManagementOpen] = useState(false)
    const [assetContentMobileMode,setAssetContentMobileMode] = useState(false)
    const [incidentCount,setIncidentcount] = useState<number>(0)
    const [isLoading,setIsLoading] = useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const dropdownSettingsRef = useRef<HTMLDivElement>(null);
    const dropdownContentManagementRef = useRef<HTMLDivElement>(null);
    const dropdownAssetManagementRef = useRef<HTMLDivElement>(null);

    const [admin,setAdmin] = useState<IAdmin | null>(null);

    async function fetchIncidents(role:string,admin_id: string|null){
        let data
        if(role === 'superadmin'){
            data = await fetchData(`/api/incidents/admin?count=true`,setIsLoading);
        }else{
            data = await fetchData(`/api/incidents?adminId=${admin_id}&count=true`,setIsLoading);
        }
        setIncidentcount(data.count)
    }

    useEffect(()=>{
        const adminData = localStorage.getItem('admin_user');
        const connectedAdmin : IAdmin = adminData ? JSON.parse(adminData) : null;
        fetchIncidents(connectedAdmin.role,connectedAdmin._id)
    },[])

    useEffect(()=>{
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            r.push('/');
        }else{
            const adminData = localStorage.getItem('admin_user');
        const connectedAdmin : IAdmin = adminData ? JSON.parse(adminData) : null;
            if (connectedAdmin) {
                setAdmin(connectedAdmin);
                if (connectedAdmin .role !== 'superadmin' && pathname.startsWith('/cms')) {
                    r.push('/dashboard'); // Redirect to login page if not superadmin
                }
            } else {
                r.push('/'); // Redirect to login page if no admin data
            }
        }
    },[r,pathname])

    function onLogout(){
        localStorage.removeItem('authToken');
        localStorage.removeItem('admin_user');
        r.push('/'); // Redirect to login page
    }

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownSettingsRef.current && !dropdownSettingsRef.current.contains(event.target as Node)) {
          setIsSettingsOpen(false);
        }
        if (dropdownContentManagementRef.current && !dropdownContentManagementRef.current.contains(event.target as Node)) {
          setIsContentManagenentOpen(false);
        }
        if (dropdownAssetManagementRef.current && !dropdownAssetManagementRef.current.contains(event.target as Node)) {
          setIsAssetManagementOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper function to determine active link
    const isActive = (path: string) => {
        return pathname === path;
    };
    
    return (
        <header className="bg-[#2A2A72] text-white p-4 shadow-md sticky top-0 z-40">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    {/* Mobile view */}

                    {/* Mobile Hamburger */}
                    <div className="lg:hidden">
                        <button onClick={() => setIsMenuOpen(true)}>
                            <Bars3Icon className="h-6 w-6 text-white" />
                        </button>
                    </div>
                    {/* Mobile Dropdown Menu */}
                    <Transition
                        show={isMenuOpen}
                        enter="transition transform duration-300 ease-out"
                        enterFrom="translate-x-full opacity-0"
                        enterTo="translate-x-0 opacity-100"
                        leave="transition transform duration-200 ease-in"
                        leaveFrom="translate-x-0 opacity-100"
                        leaveTo="translate-x-full opacity-0"
                    >
                        <div className="fixed inset-0 z-50 bg-white shadow-md lg:hidden flex flex-col">
                            {/* Sticky header with close button */}
                            <div className="sticky top-0 flex justify-end p-4 bg-white border-b">
                                <button onClick={() => setIsMenuOpen(false)}>
                                    <XMarkIcon className="h-6 w-6 text-[#2A2A72]" />
                                </button>
                            </div>

                            <nav className="flex-1 overflow-y-auto flex flex-col space-y-4 p-6 text-gray-700">
                                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}
                                className={`hover:text-[#FFA400] transition-colors duration-200 font-medium ${
                                    isActive("/dashboard") ? "text-[#FFA400]" : ""
                                }`}>
                                    Dashboard
                                </Link>

                                <Link href="/management" onClick={() => setIsMenuOpen(false)}
                                    className={`hover:text-[#FFA400]/80 transition-colors duration-200 font-medium ${
                                        isActive("/management") ? "text-[#FFA400]" : ""
                                    }`}>
                                    Incident Management
                                    {incidentCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {incidentCount}
                                        </span>
                                    )}
                                </Link>

                                {admin?.role === "superadmin" && (
                                <div>
                                    <button
                                        onClick={() => setContentMobileMode(!contentMobileMode)}
                                        className="flex items-center space-x-2 w-full font-medium hover:text-[#FFA400]"
                                    >
                                        <span>Content Management</span>
                                        <ChevronDownIcon
                                            className={`h-4 w-4 transition-transform ${contentMobileMode ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    {contentMobileMode && (
                                    <div className="mt-2 space-y-2 pl-4">
                                        <Link href="/cms/administrators" onClick={() => setIsMenuOpen(false)} className="block text-sm text-gray-700 hover:text-[#FFA400]">
                                            Administrators
                                        </Link>
                                        <Link href="/cms/locals" onClick={() => setIsMenuOpen(false)} className="block text-sm text-gray-700 hover:text-[#FFA400]">
                                            Locals
                                        </Link>
                                        <Link href="/cms/departments" onClick={() => setIsMenuOpen(false)} className="block text-sm text-gray-700 hover:text-[#FFA400]">
                                            Departments
                                        </Link>
                                    </div>
                                    )}
                                </div>
                                )}
                                {admin?.role === "superadmin" && (
                                <div>
                                    <button
                                        onClick={() => setAssetContentMobileMode(!assetContentMobileMode)}
                                        className="flex items-center space-x-2 w-full font-medium hover:text-[#FFA400]"
                                    >
                                        <span>Asset Management</span>
                                        <ChevronDownIcon
                                            className={`h-4 w-4 transition-transform ${assetContentMobileMode ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>

                                    {assetContentMobileMode && (
                                    <div className="mt-2 space-y-2 pl-4">
                                        <Link href="/IT_assets" onClick={() => setIsMenuOpen(false)} className="block text-sm text-gray-700 hover:text-[#FFA400]">
                                            Dashboard
                                        </Link>
                                        <Link href="/IT_assets/management" onClick={() => setIsMenuOpen(false)} className="block text-sm text-gray-700 hover:text-[#FFA400]">
                                            Management
                                        </Link>
                                        <Link href="/IT_assets/asset_type" onClick={() => setIsMenuOpen(false)} className="block text-sm text-gray-700 hover:text-[#FFA400]">
                                            Asset types
                                        </Link>
                                    </div>
                                    )}
                                </div>
                                )}
                            </nav>
                        </div>
                    </Transition>

                    <Image src="/Logo.svg" alt='IRIS' width={100} height={100} priority className="text-2xl font-bold"/>

                    {/* Desktop view */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        <Link href="/dashboard" 
                            className={`hover:text-[#FFA400] transition-colors duration-200 font-medium ${
                                isActive('/dashboard') ? 'text-[#FFA400]' : ''
                            }`}
                            aria-current={isActive('/dashboard') ? 'page' : undefined}
                            >
                            Dashboard
                        </Link>
                        <Link 
                            href="/management" 
                            className={`hover:text-[#FFA400]/80 transition-colors duration-200 font-medium ${
                                isActive('/management') ? 'text-[#FFA400]' : ''
                            }`}
                            aria-current={isActive('/management') ? 'page' : undefined}
                        >
                            Incident Management
                            {incidentCount > 0 && (
                                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {incidentCount}
                                </span>
                            )}
                        </Link>
                        {
                            admin?.role === 'superadmin' && (
                                <div className="flex items-center space-x-4">
                                    <div className="relative" ref={dropdownContentManagementRef}>
                                        <button
                                            onClick={() => setIsContentManagenentOpen(!isContentManagementOpen)}
                                            className={`flex cursor-pointer items-center space-x-2 hover:text-[#FFA400] focus:outline-none ${
                                                pathname.startsWith('/cms') ? 'text-[#FFA400]' : ''
                                            }`}
                                        >
                                            <span className="font-medium hidden sm:inline">Content Management</span>
                                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isContentManagementOpen ? 'transform rotate-180' : ''}`}/>
                                        </button>
                    
                                    {/* Dropdown panel */}
                                    {isContentManagementOpen && (
                                        <div className="absolute right-0 mt-2 w-48 font-medium bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                            <Link href="/cms/administrators" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FFA400]/50">
                                                <UserCircleIcon className="h-5 w-5 mr-3 text-gray-700" />
                                                Administrators
                                            </Link>
                                            <Link href="/cms/locals" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FFA400]/50">
                                                <BuildingOffice2Icon className="h-5 w-5 mr-3 text-gray-700" />
                                                Locals
                                            </Link>
                                            <Link href="/cms/departments" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FFA400]/50">
                                                <Squares2X2Icon className="h-5 w-5 mr-3 text-gray-700" />
                                                Departments
                                            </Link>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            )
                        }
                        {
                            admin?.role === 'superadmin' && (
                                <div className="flex items-center space-x-4">
                                    <div className="relative" ref={dropdownAssetManagementRef}>
                                        <button
                                            onClick={() => setIsAssetManagementOpen(!isAssetManagementOpen)}
                                            className={`flex cursor-pointer items-center space-x-2 hover:text-[#FFA400] focus:outline-none ${
                                                pathname.startsWith('/IT_assets') ? 'text-[#FFA400]' : ''
                                            }`}
                                        >
                                            <span className="font-medium hidden sm:inline">Asset Management</span>
                                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isAssetManagementOpen ? 'transform rotate-180' : ''}`}/>
                                        </button>
                    
                                    {/* Dropdown panel */}
                                    {isAssetManagementOpen && (
                                        <div className="absolute right-0 mt-2 w-48 font-medium bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                            <Link href="/IT_assets" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FFA400]/50">
                                                <ComputerDesktopIcon className="h-5 w-5 mr-3 text-gray-700" />
                                                Dashboard
                                                
                                            </Link>
                                            <Link href="/IT_assets/management" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FFA400]/50">
                                                <WrenchIcon className="h-5 w-5 mr-3 text-gray-700" />
                                                Management
                                            </Link>
                                            <Link href="/IT_assets/asset_type" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FFA400]/50">
                                                <CpuChipIcon className="h-5 w-5 mr-3 text-gray-700" />
                                                Asset Types
                                            </Link>
                                        </div>
                                    )}
                                    </div>
                                </div>
                            )
                        }
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative" ref={dropdownSettingsRef}>
                        <button onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="flex cursor-pointer items-center space-x-2 hover:text-[#FFA400] focus:outline-none">
                            <UserCircleIcon className="h-8 w-8 text-white"/>
                            <div className="flex flex-col items-start">
                                <span className="font-medium hidden sm:inline">{admin?.admin_id}</span>
                                <span className='text-sm capitalize'>{admin?.role}</span>
                            </div>
                            <ChevronDownIcon className={`h-4 w-4 transition-transform ${isSettingsOpen ? 'transform rotate-180' : ''}`}/>
                        </button>
    
                        {/* Dropdown panel */}
                        {isSettingsOpen && (
                            <div className="absolute right-0 mt-2 w-48 font-medium bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FFA400]/50">
                                    <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-700" />
                                    Settings
                                </Link>
                                <span className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FFA400]/50 cursor-pointer' onClick={onLogout}>
                                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3 text-gray-700" />
                                    Logout
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )

}