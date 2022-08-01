import { IProviderData } from '../../../interfaces/Iresponses';
import { IContracts, IPayment, IWork } from '../../../interfaces/Itables';
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

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const list = async (page?: number, cantPerPage?: number, item?: string, month?: number, year?: number, sectorId?: number, advanceSearch?: boolean) => {
        const filters: Array<IWhereParams> | undefined = [];
        if (item) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.like,
                concat: EConcatWhere.or,
                items: [
                    { column: Columns.payments.details, object: String(item) },
                    { column: Columns.payments.amount, object: String(item) },
                    { column: `${Tables.PROVIDERS}.${Columns.providers.name}`, object: String(item) },
                    { column: `${Tables.PROVIDERS}.${Columns.providers.cuit}`, object: String(item) },
                ]
            };
            filters.push(filter);
        }

        if (advanceSearch) {
            if (month) {
                filters.push({
                    mode: EModeWhere.strict,
                    concat: EConcatWhere.and,
                    items: [
                        { column: Columns.payments.month, object: String(month) }]
                })
            }
            if (year) {
                filters.push({
                    mode: EModeWhere.strict,
                    concat: EConcatWhere.and,
                    items: [
                        { column: Columns.payments.year, object: String(year) }]
                })
            }
            if (sectorId) {
                filters.push({
                    mode: EModeWhere.strict,
                    concat: EConcatWhere.and,
                    items: [
                        { column: `${Tables.PROVIDERS}.${Columns.providers.sector_id}`, object: String(sectorId) }]
                })
            }
        }

        const join1: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.payments.id_provider,
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

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.works.id_work,
                asc: false
            };
            const data = await store.list(Tables.PAYMENTS, [ESelectFunct.all], filters, undefined, pages, [join1, join2]);
            const cant = await store.list(Tables.PAYMENTS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined, [join1, join2]);
            const pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.WORKS, [ESelectFunct.all], filters, undefined, undefined, [join1, join2]);
            return {
                data
            };
        }
    }

    const provList = async (idProv: number, page?: number, cantPerPage?: number) => {
        const filters: Array<IWhereParams> | undefined = [];

        const filter: IWhereParams | undefined = {
            mode: EModeWhere.strict,
            concat: EConcatWhere.none,
            items: [
                { column: Columns.payments.id_provider, object: String(idProv) }
            ]
        };
        filters.push(filter);

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.payments.id_payment,
                asc: false
            };
            const data = await store.list(Tables.PAYMENTS, [ESelectFunct.all], filters, undefined, pages);
            const cant = await store.list(Tables.PAYMENTS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters);
            const pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.PAYMENTS, [ESelectFunct.all], filters);
            return {
                data
            };
        }
    }

    const upsert = async (body: IPayment) => {
        const providerData: Array<IProviderData> = await providersController.getProvider(body.id_provider)
        const dniProv = providerData[0].dni
        let lastNumber = 0
        const getLast: Array<{ last: number }> = await store.list(Tables.PAYMENTS, [`MAX(${Columns.payments.number}) as last`])
        if (getLast[0].last > 0) {
            lastNumber = Number(getLast[0].last) + 1
        }
        const newPayment: IPayment = {
            pv: 1,
            number: lastNumber,
            id_provider: body.id_provider,
            dni: dniProv,
            month: body.month,
            year: body.year,
            amount: body.amount,
            details: body.details,
            type: body.type,
            advance: body.advance
        }

        const resInsert: INewInsert = await store.insert(Tables.PAYMENTS, newPayment)
        if (resInsert.affectedRows > 0) {
            return resInsert
        } else {
            throw new Error(resInsert.message)
        }
    }

    const remove = async (idWork: number) => {
        const resInsert: INewInsert = await store.remove(Tables.WORKS, { id_work: idWork })
        if (resInsert.affectedRows > 0) {
            return "ok"
        } else {
            throw new Error(resInsert.message)
        }
    }

    const getUser = async (idProv: number): Promise<Array<IProviders>> => {

        return await store.getAnyCol(Tables.PROVIDERS, { id_provider: idProv });
    }

    const summaryWorks = async (fromMonth: number, fromYear: number, toMonth: number, toYear: number, idSector?: string, idProvider?: string) => {
        const filters: Array<IWhereParams> = [
            {
                mode: EModeWhere.higherEqual,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.works.month, object: String(fromMonth) },
                    { column: Columns.works.year, object: String(fromYear) }
                ]
            }, {
                mode: EModeWhere.lessEqual,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.works.month, object: String(toMonth) },
                    { column: Columns.works.year, object: String(toYear) }
                ]
            }]

        if (idSector !== "undefined") {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.none,
                items: [{ column: Columns.providers.sector_id, object: String(idSector) }]
            })
        }

        if (idProvider !== "undefined") {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.none,
                items: [{ column: `${Tables.PROVIDERS}.${Columns.providers.id_provider}`, object: String(idProvider) }]
            })
        }

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

        const order: Iorder = {
            columns: [`${Columns.works.year}`, `${Columns.works.month}`],
            asc: true
        }

        const summaryData = await store.list(Tables.WORKS, [`SUM(${Tables.WORKS}.${Columns.works.hours}) AS totalHours`, `SUM(${Tables.WORKS}.${Columns.works.amount}) AS totalAmount`, `${Columns.works.month}`, `${Columns.works.year}`], filters, [`${Columns.works.month}`, `${Columns.works.year}`], undefined, [join1, join2], order)

        return summaryData
    }

    return {
        list,
        provList,
        upsert,
        remove,
        getUser,
        summaryWorks
    }
}
