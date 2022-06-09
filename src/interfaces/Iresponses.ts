export interface INewPermissions {
    permisos: Array<INewPermission>,
    idUser: number
}

export interface INewPermission {
    idPermiso: number
}

export interface INewInsert {
    fieldCount: number,
    affectedRows: number,
    insertId: number,
    serverStatus: number,
    warningCount: number,
    message: string,
    protocol41: boolean,
    changedRows: number
}