import { IProviders } from './Itables';
import { EConcatWhere, EModeWhere, ETypesJoin } from "enums/EfunctMysql";

export interface IWhere {
    column: string,
    object: string
}
export interface IWhereParams {
    mode: EModeWhere,
    concat: EConcatWhere,
    items: Array<IWhere>
}
export interface Ipages {
    currentPage: number,
    order: string,
    cantPerPage: number,
    asc: boolean
}
export interface Iorder {
    columns: string[],
    asc: boolean
}

export interface ILike {
    columns: Array<string>,
    item: string
}

export interface IMultipleInsert {
    headers: Array<string>,
    rows: Array<any>
}
export interface IObjectFiles {
    fieldName: string,
    path: string
}
export interface IJoin {
    tableOrigin: string,
    tableJoin: string,
    colJoin: string,
    colOrigin: string,
    type: ETypesJoin
}
export interface IJoinMysql {
    tableJoin: string,
    columnOrigin: string,
    columnJoin: string
}
export interface newDataProv extends IProviders {
    totalWork: number,
    totalPayment: number | string,
    difference: number
}
