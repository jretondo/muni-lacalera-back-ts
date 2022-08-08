import { file } from './../../../network/response';
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
        Number(req.query.groupBy),
        Number(req.query.providerId),
        Number(req.query.sectorId)
    )
        .then(() => {
            success({ req, res });
        }).catch(next)
}

const advances = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.advances(
        String(req.query.date),
        Number(req.query.groupBy),
        Number(req.query.providerId),
        Number(req.query.sectorId)
    )
        .then(() => {
            success({ req, res });
        }).catch(next)
}

router
    .get("/pending", secure(EPermissions.payments), pending)
    .get("/advances", secure(EPermissions.payments), advances)

export = router;