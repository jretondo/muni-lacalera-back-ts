import { INewUser } from './../../../interfaces/Irequests';
import { Ipages, IWhereParams } from 'interfaces/Ifunctions';
import { Iauth, IUser } from 'interfaces/Itables';
import { EConcatWhere, EModeWhere, ESelectFunct } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import getPages from '../../../utils/functions/getPages';
import Authcontroller from '../auth/index';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const list = async (page?: number, item?: string, cantPerPage?: number, idUsu?: number) => {

        const filters: Array<IWhereParams> | undefined = [];
        if (item) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.like,
                concat: EConcatWhere.or,
                items: [
                    { column: Columns.admin.lastname, object: String(item) },
                    { column: Columns.admin.email, object: String(item) },
                    { column: Columns.admin.name, object: String(item) },
                    { column: Columns.admin.user, object: String(item) },
                    { column: Columns.admin.tel, object: String(item) },
                ]
            };
            filters.push(filter);
        }

        if (idUsu) {
            const filter: IWhereParams | undefined = {
                mode: EModeWhere.dif,
                concat: EConcatWhere.and,
                items: [
                    { column: Columns.admin.id, object: String(idUsu) }
                ]
            };
            filters.push(filter);
        }

        let pages: Ipages;
        if (page) {
            pages = {
                currentPage: page,
                cantPerPage: cantPerPage || 10,
                order: Columns.admin.id,
                asc: true
            };
            const data = await store.list(Tables.ADMIN, [ESelectFunct.all], filters, undefined, pages);
            const cant = await store.list(Tables.ADMIN, [`COUNT(${ESelectFunct.all}) AS COUNT`], filters, undefined, undefined);
            const pagesObj = await getPages(cant[0].COUNT, 10, Number(page));
            return {
                data,
                pagesObj
            };
        } else {
            const data = await store.list(Tables.ADMIN, [ESelectFunct.all], filters, undefined, undefined);
            return {
                data
            };
        }
    }

    const upsert = async (body: INewUser) => {

        const user: IUser = {
            name: body.name,
            lastname: body.lastname,
            email: body.email,
            user: body.userName,
            tel: body.tel
        }
        console.log('body :>> ', body);
        if (body.id) {
            return await store.update(Tables.ADMIN, user, body.id);
        } else {
            const result = await store.insert(Tables.ADMIN, user);
            const newAuth: Iauth = {
                id: result.insertId,
                user: user.user,
                prov: 1
            }
            return await Authcontroller.upsert(newAuth, body.email);
        }
    }

    const remove = async (idUser: number) => {
        await store.remove(Tables.ADMIN, { id: idUser })
            .then(async (result: any) => {
                if (result.affectedRows > 0) {
                    await store.remove(Tables.AUTH_ADMIN, { id: idUser })
                } else {
                    throw new Error();
                }
            })
    }

    const getUser = async (idUser: number): Promise<Array<IUser>> => {
        return await store.get(Tables.ADMIN, idUser);
    }

    return {
        list,
        upsert,
        remove,
        getUser
    }
}
