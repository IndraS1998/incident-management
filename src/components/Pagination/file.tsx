import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
    console.log(totalPages)
    if (totalPages <= 1) return null;
  

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    const handleClick = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
        }
    };

    return (
        <div className="flex items-center justify-center gap-2 my-4">
            {/* Previous Button */}
            <button
                onClick={() => handleClick(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm transition-colors
                ${
                    currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white border-gray-300 text-[#2A2A72] hover:bg-[#F6F6F8] cursor-pointer"
                }`}
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>

            {/* Page Numbers */}
            {pages.map((page) => (
                <button
                key={page}
                onClick={() => handleClick(page)}
                className={`px-3 py-1 rounded-md border text-sm transition-colors ${
                    currentPage === page
                    ? "bg-[#2A2A72] text-white border-[#2A2A72]"
                    : "bg-white border-gray-300 text-[#2A2A72] hover:bg-[#F6F6F8] cursor-pointer"
                }`}
                >
                {page}
                </button>
            ))}

            {/* Next Button */}
            <button
                onClick={() => handleClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm transition-colors
                ${
                    currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white border-gray-300 text-[#2A2A72] hover:bg-[#F6F6F8] cursor-pointer"
                }`}
            >
                <ChevronRightIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export default Pagination;
