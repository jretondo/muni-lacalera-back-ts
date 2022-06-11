export interface INewUser {
    id?: number,
    name: string,
    lastname: string
    email: string,
    user: string,
    tel: string
}
export interface INewPermissions {
    permissions: Array<INewPermission>,
    idUser: number
}

export interface INewPermission {
    idPermission: number
}
