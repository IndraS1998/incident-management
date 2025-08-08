interface BaseLocal{
    _id:string;
    type: 'building' | 'floor' | 'room';
}

interface IBuilding extends BaseLocal{
    type : 'building';
    building_name: string;
}

export interface IFloor extends BaseLocal{
    type: 'floor';
    floor_number: number;
    building_name: string;
}

export interface IRoom extends BaseLocal {
    type: 'room';
    room_number: string;
    floor_number: number;
    building_name: string;
    //department_id?: Types.ObjectId | IDepartment;
}

export type LocalEntity = IBuilding | IFloor | IRoom;