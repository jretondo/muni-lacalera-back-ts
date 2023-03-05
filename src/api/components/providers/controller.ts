import { createProviderListExcel } from './../../../utils/reportsGenerate/providerListExcel';
import { INewProvider } from './../../../interfaces/Irequests';
import { IJoin, Iorder } from './../../../interfaces/Ifunctions';
import { INewInsert, IProviderData } from './../../../interfaces/Iresponses';
import { IProviders, IContracts } from './../../../interfaces/Itables';
import { Ipages, IWhereParams } from 'interfaces/Ifunctions';
import { EConcatWhere, EModeWhere, ESelectFunct, ETypesJoin } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';
import { AfipClass } from '../../../utils/classes/AfipClass';
import ContractsController from '../contracts';
import moment from 'moment';
import { createProviderListPDF } from '../../../utils/reportsGenerate/providerListPDF';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const list = async (page?: number, cantPerPage?: number, item?: string, sectorId?: String, isProf?: String, isHealthProf?: String, advanceSearch?: boolean, pdfReport?: boolean, excelReport?: boolean): Promise<any> => {
        const filters: Array<IWhereParams> | undefined = [];

        if (item) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.like,
                concat: EConcatWhere.or,
                items: [
                    { column: Columns.providers.name, object: String(item) },
                    { column: Columns.providers.cuit, object: String(item) },
                    { column: Columns.providers.direction, object: String(item) },
                    { column: Columns.providers.prof_numb, object: String(item) },
                ]
            };
            filters.push(filter);
        }
        if (advanceSearch) {
            if (sectorId !== "undefined") {
                filters.push({
                    mode: EModeWhere.strict,
                    concat: EConcatWhere.and,
                    items: [
                        { column: Columns.providers.sector_id, object: String(sectorId) }]
                })
            }
            if (isProf !== "undefined") {
                filters.push({
                    mode: EModeWhere.strict,
                    concat: EConcatWhere.and,
                    items: [
                        { column: Columns.providers.is_professional, object: String(isProf) }]
                })
            }
            if (isHealthProf !== "undefined") {
                filters.push({
                    mode: EModeWhere.strict,
                    concat: EConcatWhere.and,
                    items: [
                        { column: Columns.providers.is_health_prof, object: String(isHealthProf) }]
                })
            }
        }

        const join1: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.providers.sector_id,
            colJoin: Columns.sectors.id,
            tableJoin: Tables.SECTORS,
            tableOrigin: Tables.PROVIDERS
        }
        const join2: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.providers.amount_id,
            colJoin: Columns.amounts.id,
            tableJoin: Tables.AMOUNTS,
            tableOrigin: Tables.PROVIDERS
        }

        const order: Iorder = {
            columns: [`Nombre`],
            asc: true
        }

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.providers.name,
                asc: true
            };
            const data = await store.list(Tables.PROVIDERS, [ESelectFunct.all], filters, undefined, pages, [join1, join2]);
            const cant = await store.list(Tables.PROVIDERS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined, [join1, join2]);
            const pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            let data: Array<IProviders>
            if (excelReport) {
                data = await store.list(Tables.PROVIDERS, [
                    `${Tables.PROVIDERS}.${Columns.providers.id_provider} as ID`,
                    `${Tables.PROVIDERS}.${Columns.providers.name} as Nombre`,
                    `${Tables.PROVIDERS}.${Columns.providers.dni} as DNI`,
                    `${Tables.PROVIDERS}.${Columns.providers.cuit} as CUIT`,
                    `${Tables.PROVIDERS}.${Columns.providers.direction} as Dirección`,
                    `${Tables.PROVIDERS}.${Columns.providers.category} as 'Cat. Monotributo'`,
                    `${Tables.PROVIDERS}.${Columns.providers.activity} as Actividad`,
                    `${Tables.PROVIDERS}.${Columns.providers.email} as Email`,
                    `${Tables.PROVIDERS}.${Columns.providers.phone} as Telefóno`,
                    `${Tables.SECTORS}.${Columns.sectors.sector} as Sector`
                ], filters, undefined, undefined, [join1, join2], order);
            } else {
                data = await store.list(Tables.PROVIDERS, [ESelectFunct.all], filters, undefined, undefined, [join1, join2]);
            }



            if (pdfReport) {
                const providerPDF = await createProviderListPDF(data)
                return providerPDF
            } else if (excelReport) {
                const providerExcel = await createProviderListExcel(data)
                return providerExcel
            } else {
                return {
                    data
                };
            }
        }
    }

    const upsert = async (body: INewProvider) => {
        const provider: IProviders = {
            name: body.name,
            sector_id: body.sector_id,
            dni: body.dni,
            cuit: body.cuit,
            direction: body.direction,
            prof_numb: body.prof_numb,
            is_professional: body.is_professional,
            is_health_prof: body.is_health_prof,
            hours: body.hours,
            month_amount: body.month_amount,
            amount_id: body.amount_id,
            category: body.category,
            activity: body.activity,
            email: body.email,
            phone: body.phone
        }

        if (body.id_provider) {
            const resInsert: INewInsert = await store.update(Tables.PROVIDERS, provider, body.id_provider, Columns.providers.id_provider);
            if (resInsert.affectedRows > 0) {
                return "ok"
            } else {
                throw new Error(resInsert.message)
            }
        } else {
            const resInsert: INewInsert = await store.insert(Tables.PROVIDERS, provider);
            const idProv = resInsert.insertId

            const fromDateStr = `${body.from_year}-${body.from_month}-01`
            const toDateStr = `${body.to_year}-${body.to_month}-01`
            const fromDate = moment(fromDateStr, "YYYY-MM-DD").toDate()
            const toDate = moment(toDateStr, "YYYY-MM-DD").toDate()
            toDate.setMonth(toDate.getMonth() + 1)
            toDate.setDate(toDate.getDate() - 1)

            const newContract: IContracts = {
                id_prov: idProv,
                from_contract: fromDate,
                to_contract: toDate,
                detail: "Primer contrato"
            }
            if (resInsert.affectedRows > 0) {
                await ContractsController.upsert(newContract)
                return "ok"
            } else {
                throw new Error(resInsert.message)
            }
        }
    }

    const remove = async (idProv: number) => {
        const resInsert: INewInsert = await store.remove(Tables.PROVIDERS, { id_provider: idProv })
        if (resInsert.affectedRows > 0) {
            return "ok"
        } else {
            throw new Error(resInsert.message)
        }
    }

    const getProvider = async (idProv: number): Promise<Array<IProviderData>> => {
        const filter: Array<IWhereParams> = [{
            mode: EModeWhere.strict,
            concat: EConcatWhere.none,
            items: [{ column: Columns.providers.id_provider, object: String(idProv) }]
        }]
        const join1: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.providers.sector_id,
            colJoin: Columns.sectors.id,
            tableJoin: Tables.SECTORS,
            tableOrigin: Tables.PROVIDERS
        }
        const join2: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.providers.amount_id,
            colJoin: Columns.amounts.id,
            tableJoin: Tables.AMOUNTS,
            tableOrigin: Tables.PROVIDERS
        }
        return await store.list(Tables.PROVIDERS, ["*"], filter, undefined, undefined, [join1, join2]);
    }

    const getDataFiscal = async (cuit: number) => {
        const certDir = "jretondo.crt"
        const keyDir = "jretondo.key"

        const afip = new AfipClass(20350925148, certDir, keyDir, true);
        const dataFiscal = await afip.getDataCUIT(cuit);
        return dataFiscal
    }

    return {
        list,
        upsert,
        remove,
        getProvider,
        getDataFiscal
    }
}