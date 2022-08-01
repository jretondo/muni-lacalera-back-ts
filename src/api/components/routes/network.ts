import { NextFunction, Request, Response, Router } from 'express';
import { success } from '../../../network/response';
import secure from '../../../auth/secure';
import { EPermissions } from '../../../enums/EtablesDB';
const router = Router();

const responseSuccess = (req: Request, res: Response, next: NextFunction) => {
    success({ req, res });
}

//Routes
router
    .get("/dashboard", secure(), responseSuccess)
    .get("/changePass", secure(), responseSuccess)
    .get("/userAdmin", secure(EPermissions.userAdmin), responseSuccess)
    .get("/providers", secure(EPermissions.providers), responseSuccess)
    .get("/payments", secure(EPermissions.payments), responseSuccess)
    .get("/works", secure(EPermissions.works), responseSuccess)

export = router;