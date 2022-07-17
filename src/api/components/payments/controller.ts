import { IJoin } from './../../../interfaces/Ifunctions';
import { INewInsert } from './../../../interfaces/Iresponses';
import { IProviders } from './../../../interfaces/Itables';
import { Ipages, IWhereParams } from 'interfaces/Ifunctions';
import { EConcatWhere, EModeWhere, ESelectFunct, ETypesJoin } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';
import { AfipClass } from '../../../utils/classes/AfipClass';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const list = async (page?: number, cantPerPage?: number, item?: string, idProvider?: number, month?: number, year?: number) => {
        const filters: Array<IWhereParams> | undefined = [];
        if (item) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.like,
                concat: EConcatWhere.or,
                items: [
                    { column: Columns.payments.details, object: String(item) },
                    { column: Columns.payments.amount, object: String(item) },
                ]
            };
            filters.push(filter);
        }

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
        if (idProvider) {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.payments.id_provider, object: String(idProvider) }]
            })
        }


        const join1: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.payments.id_provider,
            colJoin: Columns.providers.id_provider,
            table: Tables.PROVIDERS
        }
        const join2: IJoin = {
            type: ETypesJoin.none,
            colOrigin: Columns.providers.sector_id,
            colJoin: Columns.sectors.id,
            table: Tables.SECTORS
        }

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.payments.id,
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
            const data = await store.list(Tables.PAYMENTS, [ESelectFunct.all], filters, undefined, undefined, [join1, join2]);
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
            phone: body.phone,
            from_month: body.from_month,
            to_month: body.to_month
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