'use client'
import { useState,useEffect } from "react";
import {useForm} from "react-hook-form";
import Navbar from "@/components/navbar"
import {alertService} from "@/lib/alert.service";
import Footer from "@/components/footerComponent";

enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

const statuses : AdminStatus[] = Object.values(AdminStatus);

enum AdminRole {
  SUPERADMIN = 'superadmin',
  DEPARTMENT_ADMIN = 'incident_manager',
}

const roles: AdminRole[] = Object.values(AdminRole);

// Interfaces
interface IAdmin {
    _id:string,
    admin_id: string; // Unique identifier for the admin composed of first letter of first name and lastname
    name: string;
    email: string;
    phone: string;
    password_hash: string;
    status: AdminStatus;
    role: AdminRole;
}

export default function AdministratorsManagement(){
    const [administrators, setAdministrators] = useState<IAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, formState: { errors },setValue,watch,reset } = useForm<IAdmin>();
    const [editingAdmin, setEditingAdmin] = useState<string | null>(null);

    async function fetchAdministrators() {
        try {
            const response = await fetch('/api/administrators');
            if (!response.ok) {
                alertService.error("Failed to fetch administrators");
                return;
            }
            const data = await response.json();
            setAdministrators(data);
        } catch (error) {
            console.error('Error fetching administrators:', error);
        }
    }

    useEffect(() => {
        setLoading(true)
        fetchAdministrators();
        setLoading(false);
    }, []);

    const handleEdit = (admin: IAdmin) => {
    setEditingAdmin(admin.admin_id);
    // Set all form values for editing
    Object.entries(admin).forEach(([key, value]) => {
      setValue(key as keyof IAdmin, value);
    });
  };

  const handleSave = async (adminId: string) => {
    setLoading(true);
    try {
      const formData = watch();
      const response = await fetch(`/api/administrators`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        alertService.error("Failed to update administrator");
        return;
      }
      
      const data = await response.json();
      setAdministrators(administrators.map(admin => 
        admin.admin_id === adminId ? data.updatedAdmin : admin
      ));
      alertService.success("Administrator updated successfully");
      setEditingAdmin(null);
      reset()
    } catch (error) {
      console.error('Error updating administrator:', error);
      alertService.error("Oops! Something went wrong");
    } finally {
      setLoading(false);
    }
  };

    return(
        <>
            <div className="min-h-screen bg-[#EAF6FF]">
                <Navbar/>
                <main className="container mx-auto p-4">
                    <h1 className="text-2xl font-bold text-[#232528] mb-6">Administrator Management</h1>
                    <form onSubmit={handleSubmit(async formData =>{
                        setLoading(true);
                        try{
                            const response = await fetch('/api/administrators', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(formData),
                            });
                            if (!response.ok) {
                                alertService.error("Failed to create administrator");
                                return;
                            }
                            const data = await response.json();
                            alertService.success("Administrator created successfully");
                            setAdministrators([...administrators, data.newAdmin]);
                            reset()
                        }catch(error){
                            console.error('Error creating administrator:', error);
                            alertService.error("Oops! Something went wrong");
                        }finally{
                            setLoading(false);
                        }
                    })} 
                    className="bg-white p-4 rounded-lg shadow-md mb-6 border border-[#EAF6FF]">
                        <h2 className="text-lg font-semibold text-[#232528] mb-4">Create Administrator</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#232528] mb-1">Full Name</label>
                                    <input type="text" className="w-full p-2 border border-[#EAF6FF] focus:ring-[#FFA400] focus:ring-2 focus:border-transparent rounded focus:outline-none"
                                        placeholder="Full Name" {...register("name", { required: true })}
                                    />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#232528] mb-1">Phone</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                                    placeholder="Phone contact" {...register("phone", { required: true })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#232528] mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                                    placeholder="email" {...register("email", { required: true })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#232528] mb-1">Role</label>
                                <select className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none" 
                                {...register("role", { required: true })}>
                                    {roles.map(role =>(
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#232528] mb-1">Status</label>
                                <select className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none" 
                                {...register("status", { required: true })}>
                                    {statuses.map(s =>(
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="py-6 space-y-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                            <button disabled={loading} type="submit"
                                className={`cursor-pointer inline-flex justify-center items-center py-2.5 px-6 bg-[#FFA400] hover:bg-[#e69500]
                                    text-white font-medium rounded-md transition duration-200 ${loading ? 'pointer-events-none opacity-90' : ''}`}>
                                {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                    </svg>
                                </div>
                                ) : (
                                'Create'
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="bg-white rounded-lg shadow overflow-hidden border border-[#EAF6FF]">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-[#EAF6FF]">
                                <thead className="bg-[#2A2A72] bg-opacity-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">User Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Full Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-[#EAF6FF] uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#EAF6FF]">
                                    {administrators.map((admin) => (
                                    <tr key={admin.admin_id} className="hover:bg-[#EAF6FF] hover:bg-opacity-30">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#232528]">
                                            {admin.admin_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232528]">
                                            {admin.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {admin.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {admin.phone}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {editingAdmin === admin.admin_id ? (
                                                <select
                                                {...register("status")}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm p-1 border border-[#EAF6FF] font-medium ${
                                                    watch("status") === AdminStatus.ACTIVE 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                                }`}
                                                >
                                                {statuses.map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                                                admin.status === AdminStatus.ACTIVE 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {admin.status}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {editingAdmin === admin.admin_id ? (
                                            <select
                                            {...register("role")}
                                            className="p-1 text-sm border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                                            >
                                            {roles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                            </select>
                                        ) : (
                                            admin.role
                                        )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <div className="flex justify-start space-x-2">
                                                {editingAdmin === admin.admin_id ? (
                                                <>
                                                    <button 
                                                    type="button" 
                                                    onClick={() => handleSave(admin.admin_id)}
                                                    className="px-4 py-2 bg-[#2A2A72] text-white rounded cursor-pointer"
                                                    disabled={loading}
                                                    >
                                                    {loading ? 'Saving...' : 'Save'}
                                                    </button>
                                                    <button 
                                                    type="button" 
                                                    onClick={() => setEditingAdmin(null)}
                                                    className="px-4 py-2 bg-gray-500 text-white rounded cursor-pointer"
                                                    >
                                                    Cancel
                                                    </button>
                                                </>
                                                ) : (
                                                <>
                                                    <button 
                                                    type="button" 
                                                    className="px-4 py-2 text-white bg-[#FFA400] rounded cursor-pointer"
                                                    >
                                                    More 
                                                    </button>
                                                    <button 
                                                    type="button" 
                                                    onClick={() => handleEdit(admin)}
                                                    className="px-4 py-2 bg-[#2A2A72] text-white rounded cursor-pointer"
                                                    >
                                                    Edit
                                                    </button>
                                                </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    )
}