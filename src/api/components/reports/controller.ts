import { createAdvanceDiscountPDF } from './../../../utils/reportsGenerate/advancesDiscount';
import { newDataProv } from './../../../interfaces/Ifunctions';
import { IDetPayments } from '../../../interfaces/Itables';
import { IJoin } from '../../../interfaces/Ifunctions';
import { IProviders } from '../../../interfaces/Itables';
import { Ipages, IWhereParams, Iorder } from 'interfaces/Ifunctions';
import { EConcatWhere, EModeWhere, ESelectFunct, ETypesJoin } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';
import getMonthStr from '../../../utils/functions/getMonthStr';
import { formatMoney } from '../../../utils/functions/formatMoney';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const pending = async (month: number, year: number, providerId?: number, sectorId?: number, page?: number, cantPerPage?: number) => {
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

        const join1: IJoin = {
            type: ETypesJoin.left,
            colOrigin: Columns.providers.sector_id,
            colJoin: Columns.sectors.id,
            tableJoin: Tables.SECTORS,
            tableOrigin: Tables.PROVIDERS
        }

        const order: Iorder = {
            columns: [Columns.providers.name],
            asc: true
        }

        let pages: Ipages;
        let data: Array<IProviders>
        let pagesObj: any

        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.providers.name,
                asc: true
            };
            data = await store.list(Tables.PROVIDERS, [ESelectFunct.all], filters, undefined, pages, [join1], order);
            const cant = await store.list(Tables.PROVIDERS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined, [join1], order);
            pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
        } else {
            data = await store.list(Tables.PROVIDERS, [ESelectFunct.all], filters, undefined, undefined, [join1], order);
        }
        interface newDataProv extends IProviders {
            totalWork: number,
            totalPayment: number,
            difference: number
        }
        let newData: Array<newDataProv> = []
        let totalToPay = 0

        if (data.length > 0) {
            return await new Promise((resolve, reject) => {
                data.map(async (item, key) => {
                    const filter1: Array<IWhereParams> | undefined = [];
                    filter1.push({
                        mode: EModeWhere.strict,
                        concat: EConcatWhere.and,
                        items: [
                            { column: Columns.works.id_provider, object: String(item.id_provider) },
                            { column: Columns.works.month, object: String(month) },
                            { column: Columns.works.year, object: String(year) }
                        ]
                    })

                    const filter2: Array<IWhereParams> | undefined = [];
                    filter2.push({
                        mode: EModeWhere.strict,
                        concat: EConcatWhere.and,
                        items: [
                            { column: Columns.payment_details.id_provider, object: String(item.id_provider) },
                            { column: Columns.payment_details.month, object: String(month) },
                            { column: Columns.payment_details.year, object: String(year) }
                        ]
                    })
                    const totalWorkQuery: Array<{
                        totalWork: number
                    }> = await store.list(Tables.WORKS, [`SUM(${Columns.works.amount}) as totalWork`], filter1)
                    const totalPaymentQuery: Array<{
                        totalPayment: number
                    }> = await store.list(Tables.PAYMENT_DETAILS, [`SUM(${Columns.payment_details.amount}) as totalPayment`], filter2)

                    let workTotal = 0
                    let paymentTotal = 0
                    if ((totalWorkQuery[0].totalWork) > 0) {
                        workTotal = totalWorkQuery[0].totalWork
                    }
                    if ((totalPaymentQuery[0].totalPayment) > 0) {
                        paymentTotal = totalPaymentQuery[0].totalPayment
                    }

                    const difference = workTotal - paymentTotal

                    if (difference !== 0) {
                        newData.push({
                            ...item,
                            totalWork: workTotal,
                            totalPayment: paymentTotal,
                            difference: difference
                        })
                    }

                    totalToPay = totalToPay + difference
                    if (key === data.length - 1) {
                        resolve({ data: newData, totalToPay, pagesObj })
                    }
                })
            })
        } else {
            return {
                data: []
            }
        }
    }

    const advancesPending = async (month: number, year: number, providerId?: number, sectorId?: number, pdf?: boolean, page?: number, cantPerPage?: number) => {
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

        const join1: IJoin = {
            type: ETypesJoin.left,
            colOrigin: Columns.providers.sector_id,
            colJoin: Columns.sectors.id,
            tableJoin: Tables.SECTORS,
            tableOrigin: Tables.PROVIDERS
        }

        const order: Iorder = {
            columns: [Columns.providers.name],
            asc: true
        }

        let pages: Ipages;
        let data: Array<IProviders>
        let pagesObj: any

        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.providers.name,
                asc: true
            };
            data = await store.list(Tables.PROVIDERS, [ESelectFunct.all], filters, undefined, pages, [join1], order);
            const cant = await store.list(Tables.PROVIDERS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined, [join1], order);
            pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
        } else {
            data = await store.list(Tables.PROVIDERS, [ESelectFunct.all], filters, undefined, undefined, [join1], order);
        }

        let newData: Array<newDataProv> = []
        let totalToPay = 0

        if (data.length > 0) {
            return await new Promise((resolve, reject) => {
                data.map(async (item, key) => {
                    const filter1: Array<IWhereParams> | undefined = [];
                    filter1.push({
                        mode: EModeWhere.strict,
                        concat: EConcatWhere.and,
                        items: [
                            { column: Columns.works.id_provider, object: String(item.id_provider) },
                            { column: Columns.works.month, object: String(month) },
                            { column: Columns.works.year, object: String(year) }
                        ]
                    })

                    const filter2: Array<IWhereParams> | undefined = [];
                    filter2.push({
                        mode: EModeWhere.strict,
                        concat: EConcatWhere.and,
                        items: [
                            { column: Columns.payment_details.id_provider, object: String(item.id_provider) },
                            { column: Columns.payment_details.month, object: String(month) },
                            { column: Columns.payment_details.year, object: String(year) },
                            { column: Columns.payment_details.advance, object: String(1) }
                        ]
                    })

                    const totalPaymentQuery: Array<{
                        totalPayment: number
                    }> = await store.list(Tables.PAYMENT_DETAILS, [`SUM(${Columns.payment_details.amount}) as totalPayment`], filter2)


                    let paymentTotal = 0

                    if ((totalPaymentQuery[0].totalPayment) > 0) {
                        paymentTotal = totalPaymentQuery[0].totalPayment
                    }

                    if (paymentTotal !== 0) {
                        if (pdf) {
                            newData.push({
                                ...item,
                                totalWork: 0,
                                totalPayment: formatMoney(paymentTotal) || "",
                                difference: 0
                            })
                        } else {
                            newData.push({
                                ...item,
                                totalWork: 0,
                                totalPayment: paymentTotal,
                                difference: 0
                            })
                        }
                    }

                    totalToPay = totalToPay + paymentTotal
                    if (key === data.length - 1) {
                        if (pdf) {
                            const monthStr = getMonthStr(month)
                            const totalStr = formatMoney(totalToPay)
                            const providerPDF = await createAdvanceDiscountPDF(newData, monthStr || "", String(year), totalStr || "")
                            resolve(providerPDF)
                        } else {
                            resolve({ data: newData, totalToPay, pagesObj })
                        }
                    }
                })
            })
        } else {
            return {
                data: []
            }
        }
    }

    const advances = async (month: number, year: number, providerId?: number, sectorId?: number) => {
        const filters: Array<IWhereParams> | undefined = [];

        filters.push({
            mode: EModeWhere.higherEqual,
            concat: EConcatWhere.and,
            items: [
                { column: `${Tables.PAYMENT_DETAILS}.${Columns.payment_details.month}`, object: String(month) },
                { column: `${Tables.PAYMENT_DETAILS}.${Columns.payment_details.year}`, object: String(year) }]
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
            colOrigin: Columns.payment_details.id_provider,
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

        const join3: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.payment_details.payment_id,
            colJoin: Columns.payments.id_payment,
            tableJoin: Tables.PAYMENTS,
            tableOrigin: Tables.PAYMENT_DETAILS
        }

        let group: Array<string> = [`${Tables.PAYMENTS}.${Columns.payments.id_payment}`]

        const data: Array<IDetPayments> = await store.list(Tables.PAYMENT_DETAILS, [ESelectFunct.all], filters, group, undefined, [join1, join2, join3]);

        interface paymentsTotal {
            paymentData: IDetPayments,
            installments: Array<IDetPayments>
        }

        let newDetails: Array<paymentsTotal> = []

        if (data.length > 0) {
            return await new Promise((resolve, reject) => {
                data.map(async (item, key) => {
                    const filters2: Array<IWhereParams> | undefined = [];

                    filters2.push({
                        mode: EModeWhere.higherEqual,
                        concat: EConcatWhere.and,
                        items: [
                            { column: Columns.payment_details.month, object: String(month) },
                            { column: Columns.payment_details.year, object: String(year) }
                        ]
                    }, {
                        mode: EModeWhere.strict,
                        concat: EConcatWhere.and,
                        items: [{ column: Columns.payment_details.payment_id, object: String(item.payment_id) }]
                    })

                    const data2: Array<IDetPayments> = await store.list(Tables.PAYMENT_DETAILS, [ESelectFunct.all], filters2);

                    newDetails.push({
                        paymentData: item,
                        installments: data2
                    })
                    if (key === data.length - 1) {
                        resolve({ data: newDetails })
                    }

                })
            })
        } else {
            return { data: [] }
        }


    }

    return {
        pending,
        advances,
        advancesPending
    }
}
