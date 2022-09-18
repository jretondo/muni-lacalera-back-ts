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
        Number(req.query.month),
        Number(req.query.year),
        Number(req.query.providerId),
        Number(req.query.sectorId)
    )
        .then((data) => {
            success({ req, res, message: data });
        }).catch(next)
}

const advancesPending = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.advancesPending(
        Number(req.query.month),
        Number(req.query.year),
        Number(req.query.providerId),
        Number(req.query.sectorId)
    )
        .then((data) => {
            success({ req, res, message: data });
        }).catch(next)
}

const advancesPendingPDF = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.advancesPending(
        Number(req.query.month),
        Number(req.query.year),
        Number(req.query.providerId),
        Number(req.query.sectorId),
        Boolean(true)
    )
        .then((dataPDF: any) => {
            file(req, res, dataPDF.filePath, 'application/pdf', dataPDF.fileName, dataPDF);
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
    .get("/advancesPending", secure(EPermissions.payments), advancesPending)
    .get("/advancesPendingPDF", secure(EPermissions.payments), advancesPendingPDF)

export = router;