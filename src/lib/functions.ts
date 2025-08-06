export function createAdministratorId(str: string):string{
    const strArr = str.trim().split(/\s+/)
    if (strArr.length < 2) {
        const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26))
        return `${randomLetter}${strArr[0].toLowerCase()}`
    }
    return `${strArr[0][0].toLowerCase()}${strArr[1].toLowerCase()}`
}

