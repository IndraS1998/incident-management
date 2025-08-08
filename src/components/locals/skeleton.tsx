'use client'

export default function TableSkeleton({
  rowCount = 3,
  colCount = 3,
  hasActions = true
}: {
  rowCount?: number
  colCount?: number
  hasActions?: boolean
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#EAF6FF] overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="bg-[#2A2A72] bg-opacity-50 px-6 py-3 border-b border-[#EAF6FF]">
        <div className="h-6 w-1/4 bg-[#EAF6FF]/50 rounded animate-pulse"></div>
      </div>

      {/* Column Headers */}
      <div className="px-6 py-3 border-b border-[#EAF6FF]">
        <div className="flex space-x-4">
          {Array.from({ length: colCount }).map((_, i) => (
            <div 
              key={`header-${i}`}
              className="h-5 bg-[#EAF6FF]/30 rounded animate-pulse"
              style={{ width: `${100/(colCount + (hasActions ? 1 : 0))}%` }}
            ></div>
          ))}
          {hasActions && (
            <div className="h-5 w-[120px] bg-[#EAF6FF]/30 rounded animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-[#EAF6FF]">
        {Array.from({ length: rowCount }).map((_, rowIdx) => (
          <div key={rowIdx} className="px-6 py-3">
            <div className="flex space-x-4 items-center">
              {Array.from({ length: colCount }).map((_, colIdx) => (
                <div
                  key={`row-${rowIdx}-col-${colIdx}`}
                  className="h-4 bg-[#EAF6FF]/20 rounded animate-pulse"
                  style={{ width: `${100/(colCount + (hasActions ? 1 : 0))}%` }}
                ></div>
              ))}
              {hasActions && (
                <div className="flex space-x-2 w-[120px]">
                  <div className="h-4 w-12 bg-[#FFA400]/20 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-red-500/20 rounded animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Button Skeleton */}
      <div className="px-6 py-4 border-t border-[#EAF6FF] flex justify-end">
        <div className="h-10 w-32 bg-[#FFA400]/30 rounded-md animate-pulse"></div>
      </div>
    </div>
  )
}