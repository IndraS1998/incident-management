import React from 'react';

interface MaintenanceBadgeProps {
  nextRoutineMaintenanceDate: string | number | null;
}

const MaintenanceBadge: React.FC<MaintenanceBadgeProps> = ({ nextRoutineMaintenanceDate }) => {
  let badgeText = '';
  let badgeClass = '';

  if (typeof nextRoutineMaintenanceDate === 'number') {
    badgeText = 'Due for maintenance';
    badgeClass = 'bg-red-50 text-red-600';
  } else if (typeof nextRoutineMaintenanceDate === 'string') {
    badgeText = new Date(nextRoutineMaintenanceDate).toDateString();
    badgeClass = 'bg-blue-50 text-blue-600 ';
  } else {
    badgeText = 'N/A';
    badgeClass = 'bg-grey-50 text-grey-600 ';
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${badgeClass}`}
    >
      {badgeText}
    </span>
  );
};

export default MaintenanceBadge;
