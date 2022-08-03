import { IProviders, IAmounts, ISectors, IPayment, IDetPayments } from './Itables';
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
