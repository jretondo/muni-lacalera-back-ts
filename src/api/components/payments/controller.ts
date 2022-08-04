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

    const list = async (page?: number, cantPerPage?: number, item?: string, month?: number, year?: number, sectorId?: number, advanceSearch?: boolean) => {
        const filters: Array<IWhereParams> | undefined = [];
        if (item) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.like,
                concat: EConcatWhere.or,
                items: [
                    { column: Columns.payments.details, object: String(item) },
                    { column: Columns.payments.total, object: String(item) },
                    { column: `${Tables.PROVIDERS}.${Columns.providers.name}`, object: String(item) },
                    { column: `${Tables.PROVIDERS}.${Columns.providers.cuit}`, object: String(item) },
                ]
            };
            filters.push(filter);
        }

        if (advanceSearch) {
            const fromDateStr = `${year}-${month}-01`
            const fromDate = moment(fromDateStr, "YYYY-MM-DD").toDate()
            const toDateStr = `${year}-${month}-01`
            const toDate = moment(toDateStr, "YYYY-MM-DD").toDate()
            toDate.setMonth(toDate.getMonth() + 1)
            toDate.setDate(toDate.getDate() - 1)

            filters.push({
                mode: EModeWhere.higherEqual,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.payments.date, object: String(moment(fromDate).format("YYYY-MM-DD")) }]
            })


            filters.push({
                mode: EModeWhere.lessEqual,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.payments.date, object: String(moment(toDate).format("YYYY-MM-DD")) }]
            })

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
            tableOrigin: Tables.PAYMENTS
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
                order: Columns.payments.id_payment,
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

    const upsert = async (body: INewPayment) => {
        const providerData: Array<IProviderData> = await providersController.getProvider(body.id_provider)
        const dniProv = providerData[0].dni
        let lastNumber = 0
        const getLast: Array<{ last: number }> = await store.list(Tables.PAYMENTS, [`MAX(${Columns.payments.number}) as last`])

        if (getLast[0].last > 0) {
            lastNumber = Number(getLast[0].last) + 1
        } else {
            lastNumber = 1
        }
        const datePayment = moment(body.date).toDate()
        const monthPayment = datePayment.getMonth() + 1
        const yearPayment = datePayment.getFullYear()
        const newPayment: IPayment = {
            pv: 1,
            number: lastNumber,
            id_provider: body.id_provider,
            dni: dniProv,
            total: body.total,
            details: body.details,
            type: "",
            advance: body.advance,
            month: monthPayment,
            year: yearPayment
        }

        const resInsert: INewInsert = await store.insert(Tables.PAYMENTS, newPayment)
        if (resInsert.affectedRows > 0) {
            const periods = body.periods
            await new Promise((resolve, reject) => {
                periods.map(async (period, key) => {
                    period.id_provider = body.id_provider
                    period.payment_id = resInsert.insertId
                    await store.insert(Tables.PAYMENT_DETAILS, period)
                    if (key === periods.length - 1) {
                        resolve("")
                    }
                })
            })
            body.date = new Date()
            const providerData: Array<IProviderData> = await providersController.getProvider(body.id_provider)
            const dataPdf = await createPDFPayment(newPayment, body.periods, providerData[0])

            setTimeout(() => {
                fs.unlinkSync(dataPdf.filePath)
            }, 6000);

            return dataPdf
        } else {
            throw new Error(resInsert.message)
        }
    }

    const rePrintPDFPayment = async (idPayment: number) => {
        const paymentData: Array<IPayment> = await store.getAnyCol(Tables.PAYMENTS, { id_payment: idPayment })
        const detPayment: Array<IDetPayments> = await store.getAnyCol(Tables.PAYMENT_DETAILS, { payment_id: idPayment })
        const providerData: Array<IProviderData> = await providersController.getProvider(paymentData[0].id_provider)
        const dataPdf = await createPDFPayment(paymentData[0], detPayment, providerData[0])

        setTimeout(() => {
            fs.unlinkSync(dataPdf.filePath)
        }, 6000);

        return dataPdf
    }

    const remove = async (idPayment: number) => {
        const resInsert: INewInsert = await store.remove(Tables.PAYMENTS, { id_payment: idPayment })
        if (resInsert.affectedRows > 0) {
            return "ok"
        } else {
            throw new Error(resInsert.message)
        }
    }

    const summaryPayments = async (fromMonth: number, fromYear: number, toMonth: number, toYear: number, idSector?: string, idProvider?: string) => {

        const filters: Array<IWhereParams> = [
            {
                mode: EModeWhere.higherEqual,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.payments.month, object: String(fromMonth) },
                    { column: Columns.payments.year, object: String(fromYear) }
                ]
            }, {
                mode: EModeWhere.lessEqual,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.payments.month, object: String(toMonth) },
                    { column: Columns.payments.year, object: String(toYear) }
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
            colOrigin: Columns.payments.id_provider,
            colJoin: Columns.providers.id_provider,
            tableJoin: Tables.PROVIDERS,
            tableOrigin: Tables.PAYMENTS
        }

        const join2: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.providers.sector_id,
            colJoin: Columns.sectors.id,
            tableJoin: Tables.SECTORS,
            tableOrigin: Tables.PROVIDERS
        }

        const order: Iorder = {
            columns: [`${Columns.payments.year}`, `${Columns.payments.month}`],
            asc: true
        }

        const summaryData = await store.list(Tables.PAYMENTS, [`SUM(${Tables.PAYMENTS}.${Columns.payments.total}) AS totalAmount`, `${Columns.payments.month}`, `${Columns.payments.year}`], filters, [`${Columns.payments.month}`, `${Columns.payments.year}`], undefined, [join1, join2], order)

        return summaryData
    }

    return {
        list,
        provList,
        upsert,
        remove,
        summaryPayments,
        rePrintPDFPayment
    }
}
