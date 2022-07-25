import { IJoin } from '../../../interfaces/Ifunctions';
import { INewInsert } from '../../../interfaces/Iresponses';
import { IProviders } from '../../../interfaces/Itables';
import { Ipages, IWhereParams } from 'interfaces/Ifunctions';
import { EConcatWhere, EModeWhere, ESelectFunct, ETypesJoin } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';

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
                order: Columns.works.id_payment,
                asc: false
            };
            const data = await store.list(Tables.WORKS, [ESelectFunct.all], filters, undefined, pages, [join1, join2]);
            const cant = await store.list(Tables.WORKS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined, [join1, join2]);
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

    const upsert = async (body: IProviders) => {
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

        return await store.getAnyCol(Tables.PROVIDERS, { id_provider: idProv });
    }

    return {
        list,
        upsert,
        remove,
        getUser
    }
}
