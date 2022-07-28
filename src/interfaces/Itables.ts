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

export interface IAmounts {
    id?: number,
    amount_name: string,
    amount: number,
    per_hour: boolean,
    description: string
}
export interface IPayments {
    id_payment?: number,
    id_provider: number,
    hours: number,
    price_hour: number,
    amount: number,
    extra: boolean,
    month: number,
    year: number,
    details: string
}

export interface ISectors {
    id?: number,
    sector: string,
    description: string
}

export interface IProviders {
    id_provider?: number,
    name: string,
    sector_id: number,
    dni: string,
    cuit: string,
    direction: string,
    prof_numb: string,
    is_professional: boolean,
    is_health_prof: boolean,
    hours: number,
    month_amount: number,
    amount_id: number,
    category: string,
    activity: string,
    email: string,
    phone: string,
    created?: Date,
    updated?: Date
}

export interface IContracts {
    id_contract?: number,
    id_prov: number,
    from_contract: Date,
    to_contract: Date,
    created?: Date,
    detail?: string
}