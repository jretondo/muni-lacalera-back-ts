import { IDetPayments, IPayment, IProviders } from './Itables';
export interface INewUser {
    id?: number,
    name: string,
    lastname: string
    email: string,
    userName: string,
    tel: string
}
export interface INewPermissions {
    permissions: Array<INewPermission>,
    idUser: number
}

export interface INewPermission {
    idPermission: number
}

export interface INewProvider extends IProviders {
    from_month: number,
    to_month: number,
    from_year: number,
    to_year: number
}

export interface INewPayment extends IPayment {
    periods: Array<IDetPayments>
}