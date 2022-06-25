import { INewInsert } from './../../../interfaces/Iresponses';
import { ISectors } from './../../../interfaces/Itables';
import { Ipages, IWhereParams } from 'interfaces/Ifunctions';
import { IUser } from 'interfaces/Itables';
import { EConcatWhere, EModeWhere, ESelectFunct } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const list = async (page?: number, cantPerPage?: number, item?: string) => {

        const filters: Array<IWhereParams> | undefined = [];
        if (item) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.like,
                concat: EConcatWhere.or,
                items: [
                    { column: Columns.sectors.sector, object: String(item) },
                    { column: Columns.sectors.description, object: String(item) },
                    { column: Columns.sectors.id, object: String(item) }
                ]
            };
            filters.push(filter);
        }

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.sectors.sector,
                asc: true
            };
            const data = await store.list(Tables.SECTORS, [ESelectFunct.all], filters, undefined, pages);
            const cant = await store.list(Tables.SECTORS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined);
            const pagesObj = await getPages(cant[0].COUNT, cantPerPage || 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.SECTORS, [ESelectFunct.all], filters, undefined, undefined);
            return {
                data
            };
        }
    }

    const upsert = async (body: ISectors) => {
        const sector: ISectors = {
            sector: body.sector,
            description: body.description
        }
        if (body.id) {
            return await store.update(Tables.SECTORS, sector, body.id);
        } else {
            return await store.insert(Tables.SECTORS, sector);
        }
    }

    const remove = async (idSector: number) => {
        const response: INewInsert = await store.remove(Tables.SECTORS, { id: idSector })
        if (response.affectedRows > 0) {
            return ""
        } else {
            throw Error("Internal error")
        }
    }

    const getSector = async (idSector: number): Promise<Array<IUser>> => {
        return await store.get(Tables.SECTORS, idSector);
    }

    return {
        list,
        upsert,
        remove,
        getSector
    }
}
