import { LocationDataType } from "./dataTypes";

const getOrdinalSuffix = (num: number): string => {
    if (num % 100 >= 11 && num % 100 <= 13) return 'th';
    switch (num % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
};
const formatLocation = (location: LocationDataType | null): string => {
    if (!location) return 'Not assigned';
    return `${location.department} / ${location.building} / ${location.floor}${getOrdinalSuffix(location.floor)} Floor / Room ${location.room_number}`;
};

export {formatLocation}