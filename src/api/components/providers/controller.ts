import { INewInsert } from './../../../interfaces/Iresponses';
import { IProviders } from './../../../interfaces/Itables';
import { INewUser } from './../../../interfaces/Irequests';
import { Ipages, IWhereParams } from 'interfaces/Ifunctions';
import { EConcatWhere, EModeWhere, ESelectFunct } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';
import { AfipClass } from '../../../utils/classes/AfipClass';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const list = async (page?: number, cantPerPage?: number, item?: string, sectorId?: number, isProf?: boolean, isHealthProf?: boolean) => {

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
        if (sectorId) {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.providers.sector_id, object: String(sectorId) }]
            })
        }
        if (isProf) {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.providers.is_professional, object: String(isProf) }]
            })
        }
        if (isHealthProf) {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.providers.is_health_prof, object: String(isHealthProf) }]
            })
        }

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.providers.name,
                asc: true
            };
            const data = await store.list(Tables.PROVIDERS, [ESelectFunct.all], filters, undefined, pages);
            const cant = await store.list(Tables.PROVIDERS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined);
            const pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.PROVIDERS, [ESelectFunct.all], filters, undefined, undefined);
            return {
                data
            };
        }
    }

    const upsert = async (body: IProviders) => {
        if (body.id) {
            const resInsert: INewInsert = await store.update(Tables.PROVIDERS, body, body.id);
            if (resInsert.affectedRows > 0) {
                return "ok"
            } else {
                throw new Error(resInsert.message)
            }
        } else {
            const resInsert: INewInsert = await store.insert(Tables.PROVIDERS, body);
            if (resInsert.affectedRows > 0) {
                return "ok"
            } else {
                throw new Error(resInsert.message)
            }
        }
    }

    const remove = async (idProv: number) => {
        const resInsert: INewInsert = await store.remove(Tables.PROVIDERS, { id: idProv })
        if (resInsert.affectedRows > 0) {
            return "ok"
        } else {
            throw new Error(resInsert.message)
        }
    }

    const getUser = async (idProv: number): Promise<Array<IProviders>> => {
        return await store.get(Tables.PROVIDERS, idProv);
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
        getUser,
        getDataFiscal
    }
}
