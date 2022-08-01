import { INewInsert } from './../../../interfaces/Iresponses';
import { IContracts } from './../../../interfaces/Itables';
import { Ipages, IWhereParams } from 'interfaces/Ifunctions';
import { EConcatWhere, EModeWhere, ESelectFunct } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';
export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const list = async (page?: number, cantPerPage?: number, idProv?: String) => {
        const filters: Array<IWhereParams> | undefined = [];

        if (idProv !== "undefined") {
            filters.push({
                mode: EModeWhere.strict,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.contracts.id_prov, object: String(idProv) }]
            })
        }

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.contracts.id_contract,
                asc: false
            };
            const data = await store.list(Tables.CONTRACTS, [ESelectFunct.all], filters, undefined, pages);
            const cant = await store.list(Tables.CONTRACTS, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters);
            const pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.CONTRACTS, [ESelectFunct.all], filters);
            return {
                data
            };
        }
    }

    const upsert = async (body: IContracts) => {
        const contract: IContracts = {
            id_prov: body.id_prov,
            from_contract: body.from_contract,
            to_contract: body.to_contract,
            detail: body.detail
        }

        const query = ` ((${Columns.contracts.from_contract} <= '${contract.from_contract}'  AND ${Columns.contracts.to_contract} >= '${contract.from_contract}')  OR   (${Columns.contracts.from_contract} <= '${contract.to_contract}'  AND ${Columns.contracts.to_contract} >= '${contract.to_contract}')) AND (${Columns.contracts.id_prov} = '${contract.id_prov}')`

        const listFilter: Array<IContracts> = await store.anyWhere(Tables.CONTRACTS, query)

        if (listFilter.length === 0) {
            if (body.id_contract) {
                const resInsert: INewInsert = await store.update(Tables.CONTRACTS, contract, body.id_contract, Columns.contracts.id_contract);
                if (resInsert.affectedRows > 0) {
                    return resInsert
                } else {
                    throw new Error(resInsert.message)
                }
            } else {
                const resInsert: INewInsert = await store.insert(Tables.CONTRACTS, contract);
                if (resInsert.affectedRows > 0) {
                    return resInsert
                } else {
                    throw new Error(resInsert.message)
                }
            }
        } else {
            throw new Error("El contrato pisa un contrato existente!")
        }
    }

    const remove = async (idContract: number) => {
        const resInsert: INewInsert = await store.remove(Tables.CONTRACTS, { id_contract: idContract })
        if (resInsert.affectedRows > 0) {
            return "ok"
        } else {
            throw new Error(resInsert.message)
        }
    }

    const getContract = async (idContract: number): Promise<Array<IContracts>> => {
        return await store.getAnyCol(Tables.CONTRACTS, { id_contract: idContract });
    }

    return {
        list,
        upsert,
        remove,
        getContract
    }
}