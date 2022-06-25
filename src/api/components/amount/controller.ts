import { IAmounts } from './../../../interfaces/Itables';
import { INewInsert } from '../../../interfaces/Iresponses';
import { Ipages, IWhereParams } from 'interfaces/Ifunctions';
import { IUser } from 'interfaces/Itables';
import { EConcatWhere, EModeWhere, ESelectFunct } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const list = async (page?: number, cantPerPage?: number, item?: string, type?: number) => {

        const filters: Array<IWhereParams> | undefined = [];
        if (item) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.like,
                concat: EConcatWhere.or,
                items: [
                    { column: Columns.amounts.name, object: String(item) },
                    { column: Columns.amounts.description, object: String(item) },
                    { column: Columns.amounts.id, object: String(item) }
                ]
            };
            filters.push(filter);
        }
        if (type) {
            const filter2: IWhereParams | undefined = {
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.amounts.per_hour, object: String(type) }
                ]
            };
            filters.push(filter2);
        }

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.amounts.name,
                asc: true
            };
            const data = await store.list(Tables.AMOUNTS, [ESelectFunct.all], filters, undefined, pages);
            const cant = await store.list(Tables.AMOUNTS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined);
            const pagesObj = await getPages(cant[0].COUNT, cantPerPage || 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.AMOUNTS, [ESelectFunct.all], filters, undefined, undefined);
            return {
                data
            };
        }
    }

    const upsert = async (body: IAmounts) => {
        const amount: IAmounts = {
            name: body.name,
            amount: body.amount,
            per_hour: body.per_hour,
            description: body.description
        }
        if (body.id) {
            return await store.update(Tables.AMOUNTS, amount, body.id);
        } else {
            return await store.insert(Tables.AMOUNTS, amount);
        }
    }

    const remove = async (idAmount: number) => {
        const response: INewInsert = await store.remove(Tables.AMOUNTS, { id: idAmount })
        if (response.affectedRows > 0) {
            return ""
        } else {
            throw Error("Internal error")
        }
    }

    const getSector = async (idAmount: number): Promise<Array<IUser>> => {
        return await store.get(Tables.AMOUNTS, idAmount);
    }

    return {
        list,
        upsert,
        remove,
        getSector
    }
}
