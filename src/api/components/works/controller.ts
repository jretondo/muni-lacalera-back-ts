import { IProviderData } from './../../../interfaces/Iresponses';
import { IContracts, IWork } from './../../../interfaces/Itables';
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
                    { column: Columns.works.details, object: String(item) },
                    { column: Columns.works.amount, object: String(item) },
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
                        { column: Columns.works.month, object: String(month) }]
                })
            }
            if (year) {
                filters.push({
                    mode: EModeWhere.strict,
                    concat: EConcatWhere.and,
                    items: [
                        { column: Columns.works.year, object: String(year) }]
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

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.works.id_work,
                asc: false
            };
            const data = await store.list(Tables.WORKS, [ESelectFunct.all, `${Tables.WORKS}.${Columns.works.hours} as hours`], filters, undefined, pages, [join1, join2]);
            const cant = await store.list(Tables.WORKS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined, [join1, join2]);
            const pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.WORKS, [ESelectFunct.all, `${Tables.WORKS}.${Columns.works.hours} as hours`], filters, undefined, undefined, [join1, join2]);
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
                { column: Columns.works.id_provider, object: String(idProv) }
            ]
        };
        filters.push(filter);

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.works.id_work,
                asc: false
            };
            const data = await store.list(Tables.WORKS, [ESelectFunct.all], filters, undefined, pages);
            const cant = await store.list(Tables.WORKS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters);
            const pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.WORKS, [ESelectFunct.all], filters);
            return {
                data
            };
        }
    }

    const upsert = async (body: IWork, isHealthProf: boolean) => {
        const dateStr = `${body.year}-${body.month}-01`
        const providerData: Array<IProviderData> = await providersController.getProvider(body.id_provider)
        const query = ` (${Columns.contracts.from_contract} <= '${dateStr}'  AND ${Columns.contracts.to_contract} >= '${dateStr}')  AND (${Columns.contracts.id_prov} = '${body.id_provider}')`
        const contract: Array<IContracts> = await store.anyWhere(Tables.CONTRACTS, query)
        let idContract: number = 0

        if (contract.length > 0) {
            idContract = contract[0].id_contract || 0
        } else {
            const date: Date = moment(dateStr, "YYYY-MM-DD").toDate()
            const beginSecond = moment(`${date.getFullYear()}-07-01`, "YYYY-MM-DD").toDate()
            let fromNewContract
            let toNewContract

            if (date < beginSecond) {
                fromNewContract = moment(`${date.getFullYear()}-01-01`, "YYYY-MM-DD").toDate()
                toNewContract = moment(`${date.getFullYear()}-06-30`, "YYYY-MM-DD").toDate()
            } else {
                fromNewContract = moment(`${date.getFullYear()}-01-07`, "YYYY-MM-DD").toDate()
                toNewContract = moment(`${date.getFullYear()}-12-31`, "YYYY-MM-DD").toDate()
            }

            const newContract: IContracts = {
                id_prov: body.id_provider,
                from_contract: fromNewContract,
                to_contract: toNewContract,
                detail: "Contrato creado automáticamente"
            }
            const resNewContract: INewInsert = await contractsController.upsert(newContract)
            idContract = resNewContract.insertId
        }

        if (isHealthProf) {
            let totalHours: number = 0
            const filterHours: Array<IWhereParams> = [{
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.works.id_provider, object: String(body.id_provider) },
                    { column: Columns.works.id_contract, object: String(idContract) }
                ]
            }]

            const hoursWork: Array<{ totalHours: number }> = await store.list(Tables.WORKS, [`SUM(${Columns.works.hours}) as totalHours`], filterHours)
            totalHours = hoursWork[0].totalHours

            const contractHours: number = providerData[0].hours
            const totalSumHours: number = body.hours + totalHours

            if (totalSumHours < contractHours) {
                const newWork: IWork = {
                    id_provider: body.id_provider,
                    hours: body.hours,
                    price_hour: providerData[0].amount,
                    amount: providerData[0].amount * body.hours,
                    extra: false,
                    month: body.month,
                    year: body.year,
                    details: body.details,
                    id_contract: idContract
                }
                const resNewWork: INewInsert = await store.insert(Tables.WORKS, newWork)
                if (resNewWork.affectedRows > 0) {
                    return resNewWork
                } else {
                    throw new Error(resNewWork.message)
                }
            } else {
                const extraHours = totalSumHours - contractHours
                const restHours = body.hours - extraHours

                if (restHours > 0) {
                    const newWork1: IWork = {
                        id_provider: body.id_provider,
                        hours: restHours,
                        price_hour: providerData[0].amount,
                        amount: providerData[0].amount * restHours,
                        extra: false,
                        month: body.month,
                        year: body.year,
                        details: body.details,
                        id_contract: idContract
                    }
                    const resNewWork1: INewInsert = await store.insert(Tables.WORKS, newWork1)
                    if (resNewWork1.affectedRows > 0) {
                        const newWork2: IWork = {
                            id_provider: body.id_provider,
                            hours: extraHours,
                            price_hour: providerData[0].amount,
                            amount: providerData[0].amount * extraHours,
                            extra: true,
                            month: body.month,
                            year: body.year,
                            details: body.details,
                            id_contract: idContract
                        }
                        const resNewWork2: INewInsert = await store.insert(Tables.WORKS, newWork2)
                        if (resNewWork2.affectedRows > 0) {
                            return resNewWork2
                        } else {
                            throw new Error(resNewWork2.message)
                        }
                    } else {
                        throw new Error(resNewWork1.message)
                    }
                } else {
                    const newWork2: IWork = {
                        id_provider: body.id_provider,
                        hours: body.hours,
                        price_hour: providerData[0].amount,
                        amount: providerData[0].amount * body.hours,
                        extra: true,
                        month: body.month,
                        year: body.year,
                        details: body.details,
                        id_contract: idContract
                    }
                    const resNewWork2: INewInsert = await store.insert(Tables.WORKS, newWork2)
                    if (resNewWork2.affectedRows > 0) {
                        return resNewWork2
                    } else {
                        throw new Error(resNewWork2.message)
                    }
                }
            }
        } else {

            let totalAmount: number = 0
            const filterAmount: Array<IWhereParams> = [{
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.works.id_provider, object: String(body.id_provider) },
                    { column: Columns.works.month, object: String(body.month) },
                    { column: Columns.works.year, object: String(body.year) }
                ]
            }]

            const amountWork: Array<{ totalAmount: number }> = await store.list(Tables.WORKS, [`SUM(${Columns.works.amount}) as totalAmount`], filterAmount)
            if (amountWork[0].totalAmount !== null) {
                totalAmount = amountWork[0].totalAmount
            }


            const contractAmount: number = providerData[0].amount
            const totalSumAmount: number = Number(body.amount) + Number(totalAmount)

            console.log('totalSumAmount :>> ', totalSumAmount);

            if (totalSumAmount < contractAmount) {
                const newWork: IWork = {
                    id_provider: body.id_provider,
                    hours: 0,
                    price_hour: 0,
                    amount: body.amount,
                    extra: false,
                    month: body.month,
                    year: body.year,
                    details: body.details,
                    id_contract: idContract
                }
                const resNewWork: INewInsert = await store.insert(Tables.WORKS, newWork)
                if (resNewWork.affectedRows > 0) {
                    return resNewWork
                } else {
                    throw new Error(resNewWork.message)
                }
            } else {
                const extraAmount = totalSumAmount - contractAmount
                const restAmount = body.amount - extraAmount

                if (restAmount > 0) {

                    const newWork1: IWork = {
                        id_provider: body.id_provider,
                        hours: 0,
                        price_hour: 0,
                        amount: restAmount,
                        extra: false,
                        month: body.month,
                        year: body.year,
                        details: body.details,
                        id_contract: idContract
                    }
                    const resNewWork1: INewInsert = await store.insert(Tables.WORKS, newWork1)
                    if (resNewWork1.affectedRows > 0) {
                        const newWork2: IWork = {
                            id_provider: body.id_provider,
                            hours: 0,
                            price_hour: 0,
                            amount: extraAmount,
                            extra: true,
                            month: body.month,
                            year: body.year,
                            details: body.details,
                            id_contract: idContract
                        }
                        const resNewWork2: INewInsert = await store.insert(Tables.WORKS, newWork2)
                        if (resNewWork2.affectedRows > 0) {
                            return resNewWork2
                        } else {
                            throw new Error(resNewWork2.message)
                        }
                    } else {
                        throw new Error(resNewWork1.message)
                    }
                } else {
                    const newWork2: IWork = {
                        id_provider: body.id_provider,
                        hours: 0,
                        price_hour: 0,
                        amount: body.amount,
                        extra: true,
                        month: body.month,
                        year: body.year,
                        details: body.details,
                        id_contract: idContract
                    }
                    const resNewWork2: INewInsert = await store.insert(Tables.WORKS, newWork2)
                    if (resNewWork2.affectedRows > 0) {
                        return resNewWork2
                    } else {
                        throw new Error(resNewWork2.message)
                    }
                }

            }
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
