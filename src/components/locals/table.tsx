'use client'
import {LocalEntity} from '@/lib/types/cms.types';

const createBuildingData = (body: string[]): LocalEntity => ({
    type: 'building',
    _id: body[0],
    building_name: body[1]
});

const createFloorData = (body: string[]): LocalEntity => ({
    type: 'floor',
    _id: body[0],
    building_name: body[1],
    floor_number: Number(body[2]),
});

const createRoomData = (body: string[]): LocalEntity => ({
    type: 'room',
    _id: body[0],
    room_number: body[1],
    floor_number: Number(body[2]),
    building_name: body[3]
});

export default function LocalsTable({
    tabHead,
    tabBody,
    tabTitle,
    buttonText,
    setCreationModal,
    setEditModal,
    entityType
}:{
    tabHead: string[], 
    tabBody: string[][], 
    tabTitle: string, 
    buttonText: string,
    setCreationModal : () => void,
    setEditModal: (LocalData: LocalEntity) => void,
    entityType: 'building' | 'floor' | 'room';
}) {

    return (
        <>
            {/* Add New Button */}
            <div className="mt-1 mb-3 flex justify-start">
                <button onClick={setCreationModal} className="px-4 py-2 bg-[#FFA400] hover:bg-[#e69500] text-white font-medium rounded-md capitalize cursor-pointer">
                    + Add New {buttonText}
                </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-[#F6F6F8] overflow-hidden">
                {/* Table Header */}
                <div className="bg-[#2A2A72] bg-opacity-50 px-6 py-3 border-b border-[#F6F6F8]">
                    <h2 className="text-lg font-semibold text-[#F6F6F8]">
                        {tabTitle}
                    </h2>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[#F6F6F8]">
                        <thead className="bg-[#F6F6F8] bg-opacity-30">
                            <tr>
                                {tabHead.map((head, index) => (
                                    <th key={index} className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">
                                        {head}
                                    </th>
                                ))}
                                <th className="px-6 py-3 text-left text-xs font-medium text-[#2A2A72] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-[#F6F6F8]">
                            {tabBody.map((body, index) => {
                                const getEditData = (): LocalEntity => {
                                    switch(entityType) {
                                        case 'building': return createBuildingData(body);
                                        case 'floor': return createFloorData(body);
                                        case 'room': return createRoomData(body);
                                        default:
                                            throw new Error(`Unknown entity type: ${entityType}`);
                                    }
                                };
                                
                                return (
                                    <tr key={index} className="hover:bg-[#F6F6F8]/10">
                                        {body.map((cell, cellIndex) => (
                                            <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-[#232528]">
                                                {cell}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#232528]">
                                            <div className="flex space-x-2">
                                                <button onClick={() =>setEditModal(getEditData())}
                                                    className="text-[#FFA400] hover:text-[#e69500] cursor-pointer">
                                                    Edit
                                                </button>
                                                <button className="text-red-500 hover:text-red-700 cursor-pointer">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );

}