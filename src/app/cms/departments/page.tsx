'use client'
import { useState,useEffect } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footerComponent';
import { alertService } from '@/lib/alert.service';
import {useForm,Controller} from 'react-hook-form';
import Select from "react-select";

interface Department {
  _id: string;
  department_id: string;
  name: string;
  contact: string;
  roomCount: number;
  managerCount: number;
  rooms: {
    _id:string;
    building_name: string;
    floor_number: number;
    room_number: string;
  }[];
  managers: {
    _id:string;
    name: string;
    email: string;
    role: string;
  }[];
}

enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

enum AdminRole {
  SUPERADMIN = 'superadmin',
  DEPARTMENT_ADMIN = 'incident_manager',
}

interface IRoom {
    _id: string;
    type: 'room';
    room_number: string;
    floor_number: number;
    building_name: string;
    department_id?: string;
}

interface Admin{
    _id: string;
    admin_id: string;
    name: string;
    email: string;
    phone: string;
    password_hash: string;
    status: AdminStatus;
    role: AdminRole;
}

export default function DepartmentTable() {
    const [expandedDept, setExpandedDept] = useState<string | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isModalOpen,setIsModalOpen] = useState<boolean>(false)

    async function fetchDepartments(){
        try{
            const response = await fetch('/api/departments')
            if(!response.ok){
                alertService.error("Failed to fetch departments")
                return
            }
            const data = await response.json()
            setDepartments(data)
        }catch(error){
            alertService.error("Failed to fetch departments");
            console.log('Error fetching departments:', error);
        }
    }

    // TODO make a global fetch and set service which will be used as framework for all http methods
    // Fetch data on mount
    useEffect(() => {
        fetchDepartments()
    }, []);

    return (
        <div className='bg-[#EAF6FF] min-h-screen'>
            {isModalOpen && (
                <ModalContent onClose={() => setIsModalOpen(false)} refresh={fetchDepartments} />
            )}
            <Navbar />
            <main className="container mx-auto p-4">
                <h1 className="text-2xl font-bold text-[#232528] mb-6">Department Management</h1>
                <button className="px-4 py-2 mb-2 cursor-pointer bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md transition-colors"
                    onClick={()=>setIsModalOpen(true)}
                >
                    New Department
                </button>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#EAF6FF]">
                        <thead className='bg-[#2A2A72] bg-opacity-50 text-[#EAF6FF]'>
                            <tr>
                                <th className="py-3 px-4 text-left">Department</th>
                                <th className="py-3 px-4 text-left">Contact</th>
                                <th className="py-3 px-4 text-center">Rooms</th>
                                <th className="py-3 px-4 text-center">Managers</th>
                            </tr>
                        </thead>
                        <tbody>
                        {departments.map((dept) => (
                            <>
                                {/* Main Row */}
                                <tr 
                                    key={dept._id} 
                                    className="border-t hover:bg-gray-50 cursor-pointer"
                                    onClick={() => setExpandedDept(expandedDept === dept._id ? null : dept._id)}
                                >
                                    <td className="py-3 px-4 font-medium">{dept.name}</td>
                                    <td className="py-3 px-4 text-gray-600">{dept.contact}</td>
                                    <td className="py-3 px-4 text-center">{dept.roomCount}</td>
                                    <td className="py-3 px-4 text-center">{dept.managerCount}</td>
                                    
                                </tr>

                                {/* Expanded Details Row */}
                                {expandedDept === dept._id && (
                                    <tr className="bg-gray-50">
                                        <td colSpan={5} className="px-4 py-3">
                                            <div className="grid grid-cols-2 gap-4">
                                            {/* Rooms Section */}
                                            <div>
                                                <h4 className="font-medium mb-2">Rooms</h4>
                                                <ul className="space-y-1">
                                                {dept.rooms.map((room, i) => (
                                                    <li key={i} className="text-sm">
                                                    {room.building_name}, Floor {room.floor_number}, Room {room.room_number}
                                                    </li>
                                                ))}
                                                </ul>
                                            </div>

                                            {/* Managers Section */}
                                            <div>
                                                <h4 className="font-medium mb-2">Managers</h4>
                                                <ul className="space-y-1">
                                                {dept.managers.map((manager, i) => (
                                                    <li key={i} className="text-sm">
                                                    {manager.name} ({manager.role})
                                                    </li>
                                                ))}
                                                </ul>
                                            </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                        </tbody>
                    </table>
                    </div>
            </main>
            <Footer />
        </div>
    );
}

function ModalContent({onClose,refresh}:{onClose : () => void;refresh:()=>void}){
    const [admins,setAdmins] = useState<Admin[]>([]);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [loading,setLoading] = useState<boolean>(false)

    interface DepartmentFormData {
        name: string;
        contact: string;
        department_id: string;
        rooms: string[]; // Array of room _ids
        managers: string[]; // Array of admin _ids
    }

    const { register,control, handleSubmit, formState: { errors } } = useForm<DepartmentFormData>({
        defaultValues:{rooms:[],managers:[]}
    });

    const roomOptions = rooms.map(r => ({
        value: r._id,
        label: `${r.building_name} / Etage ${r.floor_number} / Porte ${r.room_number}`
    }));

    const adminOptions = admins.map(a => ({
        value: a._id,
        label: a.name
    }));
    
    async function fetchAdmins(){
        setLoading(true)
        try {
            const response = await fetch('/api/administrators');
            if (!response.ok) {
                alertService.error("Failed to fetch administrators");
                return;
            }
            const data = await response.json();
            setAdmins(data);
        } catch (error) {
            alertService.error("Failed to fetch administrators");
            console.log('Error fetching administrators:', error);
        }finally{
            setLoading(false)
        }
    }

    async function fetchRooms(){
        setLoading(true)
        try{
            const response = await fetch('/api/locals/rooms/unassigned')
            if(!response.ok){
                alertService.error("Failed to fetch available rooms")
                return
            }
            const data = await response.json()
            setRooms(data)
        }catch(error){
            console.log(error)
            alertService.error("Failed to get available rooms")
        }finally{
            setLoading(false)
        }
    }

    const onSubmit = async (data: DepartmentFormData) => {
        console.log(data)
        setLoading(true)
        try {
            const response = await fetch('/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }
            alertService.success('Department created successfully!');
            onClose()
        } catch (error) {
            console.log(error)
            alertService.error('Failed to create room');
        }finally{
            refresh()
            setLoading(false)
        }
    };

    useEffect(() => {
        fetchAdmins()
        fetchRooms()
    }, []);

    return (
        <div className="fixed inset-0 bg-white/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                {/* Loading overlay - only shown when loading */}
                {loading && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-lg">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-solid border-t-[#2A2A72] border-r-[#2A2A72] border-b-transparent border-l-transparent"></div>
                    </div>
                )}
                <div className="bg-[#2A2A72] text-white px-6 py-3 rounded-t-lg flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Create Department</h3>
                    <button onClick={onClose} className="text-white hover:text-[#FFA400] cursor-pointer">
                        ✕
                    </button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Department Name *
                        </label>
                        <input
                            type="text" required
                            className={`w-full p-2 border rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none`}
                            {...register('name', {
                                required: 'Department name is required',
                            })}
                            />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Department Abbreviation *
                        </label>
                        <input
                            type="text" required
                            className={`w-full p-2 border rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none`}
                            {...register('department_id', {
                                required: 'Department abbreviation needed',
                            })}
                            />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Contact *
                        </label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded focus:ring-[#FFA400] focus:ring-2 focus:border-transparent focus:outline-none`}
                            {...register('contact', {
                                required: 'Contact name is required',
                                min: { value: 3, message: 'Contact' }
                            })}
                            />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Administrators *
                        </label>
                        <Controller name="managers" control={control} rules={{ required: "At least one administrator is required" }}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select {...field} isMulti options={adminOptions}
                                        value={adminOptions.filter(opt => field.value.includes(opt.value))}
                                        onChange={(selected) => field.onChange(selected.map(s => s.value))}
                                        styles={{
                                            control: (base, state) => ({
                                            ...base,
                                            borderColor: state.isFocused ? "#FFA400" : base.borderColor,
                                            boxShadow: state.isFocused ? "0 0 0 1px #FFA400" : "none",
                                            "&:hover": {
                                                borderColor: state.isFocused ? "#FFA400" : base.borderColor,
                                            },
                                            borderRadius: "0.375rem", // same as rounded
                                            padding: "2px",
                                            }),
                                            multiValue: (base) => ({
                                            ...base,
                                            backgroundColor: "#FFA40020",
                                            borderRadius: "0.375rem",
                                            }),
                                        }}
                                    />
                                    {fieldState.error && (
                                        <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                    )}
                                </>
                            )}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-[#232528] mb-1">
                            Rooms *
                        </label>
                        <Controller name="rooms" control={control} rules={{ required: "At least one room is required" }}
                            render={({ field, fieldState }) => (
                                <>
                                    <Select {...field} isMulti options={roomOptions}
                                        value={roomOptions.filter(opt => field.value.includes(opt.value))}
                                        onChange={(selected) => field.onChange(selected.map(s => s.value))}
                                        styles={{
                                            control: (base, state) => ({
                                                ...base,
                                                borderColor: state.isFocused ? "#FFA400" : base.borderColor,
                                                boxShadow: state.isFocused ? "0 0 0 1px #FFA400" : "none",
                                                "&:hover": {
                                                    borderColor: state.isFocused ? "#FFA400" : base.borderColor,
                                                },
                                                borderRadius: "0.375rem", // same as rounded
                                                padding: "2px",
                                            }),
                                            multiValue: (base) => ({
                                                ...base,
                                                backgroundColor: "#FFA40020",
                                                borderRadius: "0.375rem",
                                            }),
                                        }}
                                    />
                                    {fieldState.error && (
                                        <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                    )}
                                </>
                            )}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-[#EAF6FF] cursor-pointer text-[#232528] rounded-md hover:bg-[#EAF6FF] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 cursor-pointer bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md transition-colors"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
  );
}