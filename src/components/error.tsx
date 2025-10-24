'use client';

import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export default function ErrorPage({ refresh }: {refresh : () => void}) {

  return(
    <main className="flex flex-col items-center justify-center h-screen bg-[#F6F6F8] text-gray-500 px-4">
      {/* Icon */}
      <div className="mb-6">
        <div className="flex items-center justify-center w-32 h-32 bg-indigo-100 rounded-full">
          <WifiOff className="w-30 h-30 text-[#2A2A72]" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-semibold mb-2 text-[#2A2A72]">Network Connection Error</h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        We are having trouble connecting to our servers. This might be a temporary issue with your internet connection.
      </p>

      {/* Troubleshooting steps */}
      <div className="bg-[#FFF] shadow rounded-md p-5 mb-8 w-full max-w-md">
        <h2 className="font-medium text-gray-800 mb-3">Troubleshooting Steps:</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
          <li>Check your Wi-Fi or Ethernet connection.</li>
          <li>Try reloading the page in a few moments.</li>
          <li>If the problem persists, please contact your network administrator.</li>
        </ul>
      </div>

        {/* Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => refresh()}
          className="cursor-pointer px-5 py-2.5 rounded-md bg-[#2A2A72] text-white hover:bg-[#2A2A72]/90 transition"
        >
          Retry Connection
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-md border border-gray-300 hover:bg-gray-100 transition"
        >
          Go to Dashboard
        </Link>
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
