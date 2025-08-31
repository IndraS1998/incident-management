import { alertService } from "./alert.service"

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

export async function fetchData(url:string,loader:(val:boolean)=>void){
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
    }finally{
        loader(false)
    }
}