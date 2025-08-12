'use client'
import Footer from "@/components/footerComponent";
import Navbar from "@/components/navbar";
import {useForm} from 'react-hook-form'
import { useState,useEffect } from "react";
import {alertService} from "@/lib/alert.service";
import { useRouter } from "next/navigation";


enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

enum AdminRole {
  SUPERADMIN = 'superadmin',
  DEPARTMENT_ADMIN = 'incident_manager',
}

// Interfaces
interface IAdmin {
    _id:string,
    admin_id: string; // Unique identifier for the admin composed of first letter of first name and lastname
    name: string;
    email: string;
    phone: string;
    password_hash: string;
    confirm_password: string;
    status: AdminStatus;
    role: AdminRole;
}

export default function Settings() {
    const { register, handleSubmit, formState: { errors },setValue,watch,reset } = useForm<IAdmin>();
    const [loading,setLoading] = useState<boolean>(false)
    const [activeAdmin,setActiveAdmin] = useState<IAdmin | null>(null)
    const r = useRouter()

    useEffect(()=>{
        const adminData = localStorage.getItem('admin_user');
        const payload: IAdmin | null = adminData ? JSON.parse(adminData) : null;
        if (payload) {
            setActiveAdmin(payload);
            Object.entries(payload).forEach(([key, value]) => {
                setValue(key as keyof IAdmin, value);
            });
        }else {
            r.push('/'); // Redirect to login page if no admin data
        }
    },[r])

    return (
        <>
            <div className="min-h-screen bg-[#EAF6FF]">
                <Navbar />
                <main className="container mx-auto px-4">
                    <h1 className="text-2xl font-bold text-[#232528] my-6">Administrator Settings</h1>
                    <form onSubmit={handleSubmit(async formData =>{
                        setLoading(true);
                        try{
                            
                            const response = await fetch('/api/administrators', {
                                method: 'PUT',
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
                            alertService.success("Administrator updated successfully");
                            localStorage.removeItem('admin_user');
                            localStorage.setItem('admin_user', JSON.stringify(data.updatedAdmin));
                            setActiveAdmin(data.updatedAdmin);
                        }catch(error){
                            console.error('Error updating administrator:', error);
                            alertService.error("Oops! Something went wrong");
                        }finally{
                            setLoading(false);
                        }
                    })} 
                    className="bg-white p-4 rounded-lg shadow-md mb-6 border border-[#EAF6FF]">
                        <h2 className="text-lg font-semibold text-[#232528] mb-4">Administrator Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Disabled Fields Section */}
                            <div className="md:col-span-4 border-b border-[#2A2A72]/20 pb-4 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#232528] mb-1">Full Name</label>
                                        <input
                                        disabled
                                        type="text"
                                        className="w-full p-2 border border-[#EAF6FF] bg-[#EAF6FF]/30 rounded focus:outline-none cursor-not-allowed"
                                        placeholder="Full Name"
                                        {...register("name", { required: true })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#232528] mb-1">Email</label>
                                        <input
                                        disabled
                                        type="email"
                                        className="w-full p-2 border border-[#EAF6FF] bg-[#EAF6FF]/30 rounded focus:outline-none cursor-not-allowed"
                                        placeholder="Email"
                                        {...register("email", { required: true })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#232528] mb-1">Role</label>
                                        <input
                                        disabled
                                        type="text"
                                        className="w-full p-2 border border-[#EAF6FF] bg-[#EAF6FF]/30 rounded focus:outline-none cursor-not-allowed"
                                        placeholder="Role"
                                        {...register("role", { required: true })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#232528] mb-1">Status</label>
                                        <input
                                        disabled
                                        type="text"
                                        className="w-full p-2 border border-[#EAF6FF] bg-[#EAF6FF]/30 rounded focus:outline-none cursor-not-allowed"
                                        placeholder="Status"
                                        {...register("status", { required: true })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Editable Fields Section */}
                            <h3 className="text-lg font-semibold text-[#232528] mb-4">Edit Fields</h3>
                            <div className="md:col-span-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#232528] mb-1">Phone</label>
                                        <input
                                        type="text"
                                        className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                                        placeholder="Phone contact"
                                        {...register("phone", { required: true })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#232528] mb-1">Password</label>
                                        <input
                                            type="password"
                                            className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                                            placeholder="Password"
                                            {...register("password_hash", { required: true })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-[#232528] mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="w-full p-2 border border-[#EAF6FF] rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none"
                                            placeholder="Confirm Password"
                                            {...register("confirm_password", {
                                                required: "Please confirm your password",
                                                validate: (value) => 
                                                    value === watch('password_hash') || "Passwords do not match"
                                                })
                                            }
                                        />
                                    </div>
                                </div>
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
                                'Update'
                                )}
                            </button>
                        </div>
                    </form>
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
                        {/* Departments Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-[#EAF6FF] overflow-hidden">
                            <div className="bg-[#2A2A72] bg-opacity-50 px-6 py-3 border-b border-[#EAF6FF]">
                                <h3 className="text-lg font-semibold text-[#EAF6FF] flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    Managed Departments (3)
                                </h3>
                            </div>
                            <div className="divide-y divide-[#EAF6FF]">
                            {/* Dummy Data - Replace with API data */}
                            {[
                                { id: 1, name: "Security Operations", members: 8, lastActive: "2 hours ago" },
                                { id: 2, name: "IT Support", members: 12, lastActive: "1 day ago" },
                                { id: 3, name: "Human Resources", members: 5, lastActive: "3 days ago" }
                            ].map(dept => (
                                <div key={dept.id} className="p-4 hover:bg-[#EAF6FF]/10 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-medium text-[#232528]">{dept.name}</h4>
                                            <p className="text-sm text-[#232528]/80 mt-1">
                                                {dept.members} members • Last active {dept.lastActive}
                                            </p>
                                        </div>
                                        <button className="text-[#FFA400] hover:text-[#e69500] text-sm font-medium cursor-pointer">
                                            View →
                                        </button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* Activity History Section */}
                        <div className="bg-white rounded-lg shadow-sm border border-[#EAF6FF] overflow-hidden">
                            <div className="bg-[#2A2A72] bg-opacity-50 px-6 py-3 border-b border-[#EAF6FF]">
                                <h3 className="text-lg font-semibold text-[#EAF6FF] flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Recent Activity (5)
                                </h3>
                            </div>
                            <div className="divide-y divide-[#EAF6FF]">
                            {/* Dummy Data - Replace with API data */}
                            {[
                                { id: 1, action: "Updated department permissions", time: "10 minutes ago", icon: "🛡️" },
                                { id: 2, action: "Reset password", time: "2 hours ago", icon: "🔑" },
                                { id: 3, action: "Logged in from new device", time: "1 day ago", icon: "📱" },
                                { id: 4, action: "Edited user profile", time: "2 days ago", icon: "✏️" },
                                { id: 5, action: "Created new department", time: "1 week ago", icon: "➕" }
                            ].map(activity => (
                                <div key={activity.id} className="p-4 hover:bg-[#EAF6FF]/10 transition-colors">
                                    <div className="flex items-start">
                                        <span className="text-lg mr-3">{activity.icon}</span>
                                        <div>
                                            <p className="text-[#232528]">{activity.action}</p>
                                            <p className="text-sm text-[#232528]/60 mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

