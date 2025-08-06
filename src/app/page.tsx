'use client';
import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { alertService } from '@/lib/alert.service';

export default function AuthPage() {
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
        console.log(payload.data)
        alertService.success("Login successful!");
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
    <div className="min-h-screen flex items-center justify-center bg-[#EAF6FF] p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-[#EAF6FF] rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-[#14213d]">
            Admin Login
          </h2>
          <p className="text-[#8d99ae] mt-2">
            Access your incident management dashboard
          </p>
        </div>
        
        <div className="px-6 pb-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium text-[#14213d]">
              Login Name
            </label>
            <input
              id="username"
              type="text"
              placeholder="aadmin"
              onChange={(e) => setFormData({...formData, admin_id: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400]"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-[#14213d]">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFA400]"
            />
          </div>
          
          <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="rounded border-gray-300 text-[#FFA400] focus:ring-[#FFA400]" 
                />
                <label htmlFor="remember" className="text-sm text-[#8d99ae]">
                  Remember me
                </label>
              </div>
              <button className="text-sm text-[#FFA400] hover:underline cursor-pointer">
                Forgot password?
              </button>
            </div>
        </div>
        
        <div className="px-6 pb-6 space-y-4">
          <button
            disabled={loading}
            className={`cursor-pointer w-full py-2 px-4 bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md transition duration-200 ${
              loading ? 'pointer-events-none' : ''
            }`}
          >
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
              'Sign In'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}