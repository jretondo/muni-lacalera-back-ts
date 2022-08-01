import { IProviders, IAmounts, ISectors } from './Itables';
export interface INewPermissions {
    permissions: Array<INewPermission>,
    idUser: number
}

export interface INewPermission {
    id_permission: number
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

export interface IProviderData extends IProviders, IAmounts, ISectors {

}