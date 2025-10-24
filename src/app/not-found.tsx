'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F6F6F8] text-gray-600 px-4">
      {/* Icon */}
      <div className="mb-6">
        <div className="flex items-center justify-center w-32 h-32 bg-indigo-100 rounded-full">
          <Search className="w-20 h-20 text-[#2A2A72]" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold mb-2 text-[#2A2A72]">
        404 - Page Not Found
      </h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        We&apos;re sorry, but the page you are looking for doesn&apos;t exist or may have been moved.
      </p>

      {/* Action button */}
      <div className="w-full max-w-md mb-4">
        <Link
          href="/dashboard"
          className="block w-full text-center px-5 py-2.5 rounded-md bg-[#2A2A72] text-white hover:bg-[#2A2A72]/90 transition"
        >
          Go to Dashboard
        </Link>
      </div>

      {/* Search bar */}
      <div className="w-full max-w-md mb-8">
        <div className="bg-white shadow rounded-md w-full">
          <div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="flex-1 outline-none text-sm text-gray-700"
            />
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
