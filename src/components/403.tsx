'use client'

import { useRouter } from 'next/navigation';
import Link from 'next/link'
import { Shield, Lock } from 'lucide-react'

export default function NotAuthorized() {
  const r = useRouter()
  function onLogout(){
        localStorage.removeItem('authToken');
        localStorage.removeItem('admin_user');
        r.push('/'); // Redirect to login page
    }  
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F6F6F8] text-gray-600 px-4">
      {/* Icon */}
      <div className="mb-6">
        <div className="flex items-center justify-center w-32 h-32 bg-red-100 rounded-full">
          <Lock className="w-20 h-20 text-[#DC2626]" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold mb-2 text-[#DC2626]">
        Access Denied
      </h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>

      {/* Action buttons */}
      <div className="w-full max-w-md mb-4 space-y-3">
        <Link
          href="/dashboard"
          className="block w-full text-center px-5 py-2.5 rounded-md bg-[#2A2A72] text-white hover:bg-[#2A2A72]/90 transition cursor-pointer"
        >
          Go to Dashboard
        </Link>
        <span className='block w-full text-center px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition cursor-pointer' onClick={onLogout}>
            Sign in with different account
        </span>
      </div>

      {/* Contact admin section */}
      <div className="w-full max-w-md mb-8">
        <div className="bg-white shadow rounded-md w-full p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-[#DC2626] mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">Need access?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Contact your system administrator to request permissions for this page.
              </p>
              <Link 
                href="/dashboard" 
                className="text-sm text-[#2A2A72] hover:underline font-medium"
              >
                Contact Administrator →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 flex flex-col items-center space-y-2 text-sm text-gray-500">
        <div className="flex space-x-4">
          <Link href="/help" className="hover:underline">
            Help Center
          </Link>
          <Link href="/support" className="hover:underline">
            Contact Support
          </Link>
        </div>
        <p>© {new Date().getFullYear()} IRIS</p>
      </div>
    </main>
  )
}