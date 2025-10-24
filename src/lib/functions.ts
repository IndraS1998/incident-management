import { alertService } from "./alert.service"

enum AdminStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

enum AdminRole {
  SUPERADMIN = 'superadmin',
  DEPARTMENT_ADMIN = 'incident_manager',
}

interface IAdmin {
  _id:string;
  admin_id: string; // Unique identifier for the admin composed of first letter of first name and lastname
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  status: AdminStatus;
  role: AdminRole;
}

export function protectRoute(setter:(val:boolean)=>void){
  const adminData = localStorage.getItem('admin_user');
  const connectedAdmin : IAdmin = adminData ? JSON.parse(adminData) : null;
  if(connectedAdmin.role === AdminRole.DEPARTMENT_ADMIN){
    setter(true)
  }
}

export function createAdministratorId(str: string):string{
    const strArr = str.trim().split(/\s+/)
    if (strArr.length < 2) {
        const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26))
        return `${randomLetter}${strArr[0].toLowerCase()}`
    }
    return `${strArr[0][0].toLowerCase()}${strArr[1].toLowerCase()}`
}

export function timeSince(date: Date, now: Date = new Date()): string {
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    
    if (interval >= 1) {
      return interval === 1 
        ? `${interval} ${unit} ago` 
        : `${interval} ${unit}s ago`;
    }
  }
  
  return 'just now';
}

export async function mutateData(
  url:string,
  loader:(val:boolean)=>void,
  method:'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?:unknown,
  message?:string
){
  loader(true)
  try{
    const response = await fetch(url,{
      method,
      headers:{
        'Content-Type':'application/json'
      },
      body: JSON.stringify(body)
    })
    if(!response.ok){
      alertService.error('Server Error!. Please try again later')
      return null
    }
    if(message){
      alertService.success(message)
    }
    const data = await response.json()
    return data
    
  }catch(error){
    console.log(error)
    alertService.error('Connection Error1. Please try again later')
    return null
  }finally{
    loader(false)
  }
}

export async function fetchData(
  url:string,
  loader:(val:boolean)=>void,
){
  loader(true)
  try{
      const response = await fetch(url)
      if(!response.ok){
        alertService.error("Oops! something went wrong")
        return null
      }
      const data = await response.json()
      return data
    }catch(error){
      console.log(error)
      alertService.error("Oops! something went wrong")
      return null
    }finally{
      loader(false)
    }  
}
