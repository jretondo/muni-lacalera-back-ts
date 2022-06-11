import { EPermissions } from './../../../enums/EtablesDB';
import { NextFunction, Request, Response, Router } from 'express';
import { success } from '../../../network/response';
import Controller from './index';
import secure from '../../../auth/secure';
const router = Router();

//internal Functions
const upsert = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.upsert(req.body).then(() => {
            success({ res, req, status: 201, message: "permissions creados!" })
        }).catch(next)
}

const get = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.get(req.body.user.id).then((permissions: any) => {
            success({ req, res, message: permissions })
        }).catch(next)
}

const getOther = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.get2(Number(req.params.id)).then((permissions: any) => {
            success({ req, res, message: permissions })
        }).catch(next)
}

const getPermissions = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.getPermissions().then((permissions: any) => {
            success({ req, res, message: permissions })
        }).catch(next)
}

//Routes
router.post("/", secure(EPermissions.userAdmin), upsert);
router.put("/", secure(EPermissions.userAdmin), upsert);
router.get("/list", secure(EPermissions.userAdmin), getPermissions);
router.get("/:id", secure(EPermissions.userAdmin), getOther)
router.get("/", secure(), get);

export = router;