'use client'
import { useState } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footerComponent';
import Buildings from '@/components/locals/buildings';
import Floors from '@/components/locals/floor';
import Rooms from '@/components/locals/room';

type LocalType = 'buildings' | 'floors' | 'rooms';

export default function LocalsManagement() {
    const [activeTab, setActiveTab] = useState<LocalType>('buildings');

    return (
        <div className='min-h-screen bg-[#EAF6FF]'>
            <Navbar />
            <main className="container mx-auto p-4">
                {/* Header with Toggle Navigation */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#232528] mb-2 capitalize">Locals Management</h1>
                    <div className="flex space-x-2 mb-6">
                        {(['buildings', 'floors', 'rooms'] as LocalType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                            activeTab === tab
                                ? 'bg-[#2A2A72] text-white'
                                : 'bg-white text-[#232528] hover:bg-[#EAF6FF]'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                        ))}
                    </div>
                </div>
                {/* Conditional Rendering of Tables */}
                {activeTab === 'buildings' && <Buildings />}
                {activeTab === 'floors' && <Floors />}
                {activeTab === 'rooms' && <Rooms />}
            </main>
            <Footer />
        </div>
    );
}