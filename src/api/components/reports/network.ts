import { EPermissions } from '../../../enums/EtablesDB';
import { Router, NextFunction, Response, Request } from 'express';
import { success } from '../../../network/response';
const router = Router();
import Controller from './index';
import secure from '../../../auth/secure';

const pending = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.pending(
        Number(req.query.month),
        Number(req.query.year),
        Number(req.query.providerId),
        Number(req.query.sectorId)
    )
        .then((data) => {
            success({ req, res, message: data });
        }).catch(next)
}

const advances = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.advances(
        Number(req.query.month),
        Number(req.query.year),
        Number(req.query.providerId),
        Number(req.query.sectorId)
    )
        .then((data) => {
            success({ req, res, message: data });
        }).catch(next)
}

router
    .get("/pending", secure(EPermissions.payments), pending)
    .get("/advances", secure(EPermissions.payments), advances)

export = router;