import { INewPayment } from './../../../interfaces/Irequests';
import { IProviderData } from '../../../interfaces/Iresponses';
import { IContracts, IDetPayments, IPayment, IWork } from '../../../interfaces/Itables';
import { IJoin, IWhere } from '../../../interfaces/Ifunctions';
import { INewInsert } from '../../../interfaces/Iresponses';
import { IProviders } from '../../../interfaces/Itables';
import { Ipages, IWhereParams, Iorder } from 'interfaces/Ifunctions';
import { EConcatWhere, EModeWhere, ESelectFunct, ETypesJoin } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';
import moment from 'moment';
import contractsController from '../contracts';
import providersController from '../providers';
import { createPDFPayment } from '../../../utils/reportsGenerate/newPayment';
import fs from 'fs';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const pending = async (groupBy: number, providerId?: number, sectorId?: number) => {
        const filters: Array<IWhereParams> | undefined = [];

        if (sectorId) {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: `${Tables.PROVIDERS}.${Columns.providers.sector_id}`, object: String(sectorId) }]
            })
        }
        if (providerId) {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: `${Tables.PROVIDERS}.${Columns.providers.id_provider}`, object: String(providerId) }]
            })
        }

        console.log('filters :>> ', filters);

        const join1: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.works.id_provider,
            colJoin: Columns.providers.id_provider,
            tableJoin: Tables.PROVIDERS,
            tableOrigin: Tables.WORKS
        }

        const join2: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.providers.sector_id,
            colJoin: Columns.sectors.id,
            tableJoin: Tables.SECTORS,
            tableOrigin: Tables.PROVIDERS
        }

        const join4: IJoin = {
            type: ETypesJoin.left,
            colOrigin: Columns.works.id_provider,
            colJoin: Columns.payments.id_provider,
            tableJoin: Tables.PAYMENTS,
            tableOrigin: Tables.WORKS
        }

        let group: Array<string> = []

        if (groupBy === 2) {
            group.push(`${Tables.PROVIDERS}.${Columns.providers.sector_id}`)
        } else if (groupBy === 1) {
            group.push(`${Tables.PROVIDERS}.${Columns.providers.id_provider}`)
        }

        const data = await store.list(Tables.WORKS, [ESelectFunct.all, `SUM(${Tables.WORKS}.${Columns.works.amount}) as totalWorks`, `SUM(DISTINCT ${Tables.PAYMENTS}.${Columns.payments.total}) as totalPayments`], filters, group, undefined, [join1, join2, join4]);

        console.log('data :>> ', data);
        return {
            data
        };
    }

    const advances = async (date: string, groupBy: number, providerId?: number, sectorId?: number) => {
        const filters: Array<IWhereParams> | undefined = [];
        const today = new Date(date)
        const todayMonth = today.getMonth() + 1
        const todayYear = today.getFullYear()
        filters.push({
            mode: EModeWhere.higher,
            concat: EConcatWhere.and,
            items: [
                { column: `${Tables.PAYMENT_DETAILS}.${Columns.payment_details.month}`, object: String(todayMonth) },
                { column: `${Tables.PAYMENT_DETAILS}.${Columns.payment_details.year}`, object: String(todayYear) }]
        })

        if (sectorId) {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: `${Tables.PROVIDERS}.${Columns.providers.sector_id}`, object: String(sectorId) }]
            })
        }
        if (providerId) {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: `${Tables.PROVIDERS}.${Columns.providers.id_provider}`, object: String(providerId) }]
            })
        }

        const join1: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.payments.id_provider,
            colJoin: Columns.providers.id_provider,
            tableJoin: Tables.PROVIDERS,
            tableOrigin: Tables.PAYMENT_DETAILS
        }

        const join2: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.providers.sector_id,
            colJoin: Columns.sectors.id,
            tableJoin: Tables.SECTORS,
            tableOrigin: Tables.PROVIDERS
        }

        let group: Array<string> = [Columns.payment_details.year, Columns.payment_details.month]

        if (groupBy === 1) {
            group.push(Columns.providers.sector_id)
        } else if (groupBy === 2) {
            group.push(Columns.providers.id_provider)
        }


        const data = await store.list(Tables.PAYMENT_DETAILS, [ESelectFunct.all, `(${Tables.WORKS}.${Columns.payment_details.amount}) as total`], filters, group, undefined, [join1, join2]);

        console.log('data :>> ', data);

        return {
            data
        };
    }

    return {
        pending,
        advances
    }
}
