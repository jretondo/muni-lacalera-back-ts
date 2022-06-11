import { INewPermissions } from './../../../interfaces/Irequests';
import { IJoinMysql, IWhereParams } from 'interfaces/Ifunctions';
import { EModeWhere, EConcatWhere, ESelectFunct } from '../../../enums/EfunctMysql';
import { Tables, Columns } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const upsert = async (body: INewPermissions) => {
        if (body.permissions.length > 0) {
            await store.remove(Tables.USER_PERMISSIONS, { id_user: body.idUser })

            const headers = [Columns.userPermissions.id_permission, Columns.userPermissions.id_user]

            const permissions: Promise<Array<Array<number>>> = new Promise((resolve, reject) => {
                let prov: Array<any> = [];
                body.permissions.map((item, key) => {
                    prov.push([item.idPermission, body.idUser]);
                    if (key === body.permissions.length - 1) {
                        resolve(prov);
                    }
                })
            });

            return await store.mInsert(Tables.USER_PERMISSIONS, { headers: headers, rows: await permissions });
        } else {
            return await store.remove(Tables.USER_PERMISSIONS, { id_user: body.idUser })
        }
    }

    const getPermission = async (idUser: number, idPermission: number) => {
        let filters: Array<IWhereParams> | undefined = []
        const filter: IWhereParams = {
            mode: EModeWhere.strict,
            concat: EConcatWhere.and,
            items: [
                {
                    column: Columns.userPermissions.id_user,
                    object: String(idUser)
                },
                {
                    column: Columns.userPermissions.id_permission, object: String(idPermission)
                }
            ]
        }
        filters.push(filter);
        return await store.list(Tables.USER_PERMISSIONS, [ESelectFunct.all], filters, undefined, undefined);
    }

    const get2 = async (idUser: number) => {
        const join: IJoinMysql = {
            tableJoin: Tables.PERMISSIONS,
            columnOrigin: Columns.userPermissions.id_permission,
            columnJoin: Columns.permissions.id
        }
        let filters: Array<IWhereParams> | undefined = []
        const filter: IWhereParams = {
            mode: EModeWhere.dif,
            concat: EConcatWhere.and,
            items: [
                {
                    column: Columns.permissions.id,
                    object: String(8)
                }
            ]
        }
        filters.push(filter);
        const allPermissions = await store.list(Tables.PERMISSIONS, ["*"], filters, undefined, undefined, undefined);

        const userPermissions = await store.query(Tables.USER_PERMISSIONS, { id_user: idUser }, join, [Columns.userPermissions.id_permission]);


        const permissions: Array<any> = await new Promise((resolve, reject) => {
            const list: Array<any> = [];
            allPermissions.map((item: any, key: number) => {
                const idPermiso = item.id
                const found = userPermissions.find((element: any) => element.id_permission === idPermiso)
                if (!found) {
                    list.push(item);
                }
                if (key === allPermissions.length - 1) {
                    resolve(list);
                }
            });
        })

        return {
            userPermissions,
            permissions
        };
    }

    const get = async (idUser: number) => {
        return await store.query(Tables.USER_PERMISSIONS, { id_user: idUser }, undefined, [Columns.userPermissions.id_permission]);
    }

    const getPermissions = async () => {
        return await store.list(Tables.PERMISSIONS, ["*"], undefined, undefined, undefined, undefined)
    }

    return {
        upsert,
        getPermission,
        get,
        get2,
        getPermissions
    };
}