export interface Iauth {
    id?: number,
    user: string,
    pass?: string,
    prov: number
}
export interface IUser {
    id?: number,
    name: string,
    lastname: string
    email: string,
    user: string,
    tel: string
}
export interface IUserPermission {
    id?: number,
    id_user: number,
    id_permission: number
}

export interface IActivity {
    id?: number,
    date?: Date,
    user_id: number,
    activity_descr: string
}