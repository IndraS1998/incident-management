import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { fetchData } from '@/lib/functions';
import { 
  Cog6ToothIcon, 
  ArrowLeftOnRectangleIcon,
  ChevronDownIcon ,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { UserCircleIcon,Squares2X2Icon } from '@heroicons/react/24/solid';


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
    const [incidentCount,setIncidentcount] = useState<number>(0)
    const [isLoading,setIsLoading] = useState<boolean>(false);

    const dropdownSettingsRef = useRef<HTMLDivElement>(null);
    const dropdownContentManagementRef = useRef<HTMLDivElement>(null);

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
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Helper function to determine active link
    const isActive = (path: string) => {
        return pathname === path;
    };
    
    return (
         <header className="bg-[#2A2A72] text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <h1 className="text-2xl font-bold">Incident Reporting</h1>
                    <nav className="hidden md:flex items-center space-x-6">
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
                        
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative" ref={dropdownSettingsRef}>
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="flex cursor-pointer items-center space-x-2 hover:text-[#FFA400] focus:outline-none"
                    >
                        <span className="font-medium hidden sm:inline">{admin?.admin_id}</span>
                        <ChevronDownIcon 
                        className={`h-4 w-4 transition-transform ${isSettingsOpen ? 'transform rotate-180' : ''}`}
                        />
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