export interface Iauth {
    id?: number,
    usuario: string,
    pass?: string,
    prov: number
}
export interface IUser {
    id?: number,
    nombre: string,
    apellido: string
    email: string,
    usuario: string,
    telefono: string
}
export interface IUserPermission {
    id?: number,
    id_user: number,
    id_permission: number
}