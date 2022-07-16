import { Tables } from '../../../enums/EtablesDB';
import StoreType from '../../../store/mysql';
import bcrypt from 'bcrypt';
import { passCreator } from '../../../utils/functions/passCreator';
import { sendPass } from '../../../utils/sendEmails/sendPass';
import auth from '../../../auth';
import { Iauth } from 'interfaces/Itables';

export = (injectedStore: typeof StoreType) => {
    let store = injectedStore;

    const upsert = async (body: Iauth, email: string) => {
        let newAuth: Iauth;
        console.log('body :>> ', body);
        if (body.pass) {
            newAuth = {
                user: body.user,
                prov: body.prov,
                pass: await bcrypt.hash(body.pass, 5)
            };
            if (body.prov === 1) {
                const result = await store.update(Tables.AUTH_ADMIN, newAuth, Number(body.id));
                if (result.affectedRows > 0) {
                    return await sendPass(body.user, body.pass, email, "Nueva contraseña", false, false);
                } else {
                    return false;
                }
            } else {
                return await store.update(Tables.AUTH_ADMIN, newAuth, Number(body.id));
            }
        } else {
            const newPass = await passCreator();
            newAuth = {
                id: body.id,
                user: body.user,
                prov: 1,
                pass: await bcrypt.hash(newPass, 5)
            };
            const result = await store.insert(Tables.AUTH_ADMIN, newAuth);
            if (result.affectedRows > 0) {
                return await sendPass(body.user, newPass, email, "Nuevo usuario", true, false);
            } else {
                return false;
            }
        }
    }

    const recPass = async (email: string) => {
        const newPass = await passCreator();
        const userData = await store.query(Tables.ADMIN, { email: email });
        const idUsu = userData[0].id;
        const user = userData[0].user;
        const data: Iauth = {
            id: idUsu,
            user: user,
            prov: 1,
            pass: newPass
        };

        return await upsert(data, email);
    }

    const login = async (username: string, password: string) => {
        const data3 = await store.query(Tables.AUTH_ADMIN, { user: username })
        const data2 = await store.query(Tables.ADMIN, { user: username })
        const userData = data2[0]
        const data = {
            ...data2[0],
            ...data3[0]
        }
        const prov = data.prov
        return bcrypt.compare(password, data.pass)
            .then(same => {
                if (same) {
                    return {
                        token: auth.sign(JSON.stringify(data)),
                        userData: userData,
                        provisory: prov
                    }
                } else {
                    throw new Error('información invalida')
                }
            })
    }

    return {
        upsert,
        login,
        recPass
    }
}
