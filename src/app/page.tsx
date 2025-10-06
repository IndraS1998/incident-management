'use client'

import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { alertService } from '@/lib/alert.service';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    admin_id: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const r = useRouter()

  useEffect(()=>{
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      // Redirect to dashboard if already authenticated
      r.push('/dashboard');
    }
  },[r])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { admin_id, password } = formData;
    
    setLoading(true);

    try {
      const response = await fetch('/api/authentication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_id, password_hash: password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        alertService.error("Network Error");
        throw new Error(payload.message || 'Login failed');
      }else{
        localStorage.setItem('authToken', "true"); //API returns a token
        localStorage.setItem('admin_user', JSON.stringify(payload.data));
        r.push('/dashboard');
      }
    } catch (error) {
      console.log(error)
      alertService.error("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F6F8] px-4">
      <div className="w-full max-w-xl p-8 text-center">
        {/* Logo or Icon */}
        <div className="flex justify-center">
          <div className="w-36 h-36 flex items-center justify-center">
            <Image src="/LogoDark.svg" alt='IRIS' width={180} height={180} priority className="text-2xl font-bold"/>
          </div>
        </div>

        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Admin Login</h1>
        <p className="text-gray-500 mb-8">Welcome back to the incident Reporting and Information System</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <input
              type="text"
              name="identifier"
              placeholder="Username or Email"
              onChange={(e) => setFormData({...formData, admin_id: e.target.value})}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1C1C7D]"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2A2A72]"
            />
          </div>
          <div className="text-right">
            <a
              href="#"
              className="text-sm text-[#2A2A72] hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2A2A72] text-white py-2 rounded-md font-medium hover:bg-[#2A2A72] transition-colors focus:ring-2 focus:ring-[#2A2A72] focus:outline-none"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}
