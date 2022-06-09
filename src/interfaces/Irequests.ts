export interface INewUser {
    id?: number,
    nombre: string,
    apellido: string
    email: string,
    usuario: string,
    telefono: string
}
export interface INewPermissions {
    permisos: Array<INewPermission>,
    idUser: number
}

export interface INewPermission {
    idPermiso: number
}