import { file } from './../../../network/response';
import { EPermissions } from './../../../enums/EtablesDB';
import { Router, NextFunction, Response, Request } from 'express';
import { success } from '../../../network/response';
const router = Router();
import Controller from './index';
import secure from '../../../auth/secure';

const list = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.list(undefined, undefined, String(req.query.query ? req.query.query : ""))
        .then((listData: any) => {
            success({ req, res, status: 200, message: listData });
        }).catch(next)
};

const listPagination = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.list(
        Number(req.params.page),
        Number(req.query.cantPerPage),
        String(req.query.query ? req.query.query : ""),
        String(req.query.sectorId),
        String(req.query.isProf),
        String(req.query.isHealthProf),
        Boolean(req.query.advanceSearch)
    )
        .then((listData: any) => {
            success({ req, res, status: 200, message: listData });
        }).catch(next)
};

const listPDF = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.list(
        undefined,
        undefined,
        String(req.query.query ? req.query.query : ""),
        String(req.query.sectorId),
        String(req.query.isProf),
        String(req.query.isHealthProf),
        Boolean(req.query.advanceSearch),
        true
    )
        .then((dataPDF: any) => {
            file(req, res, dataPDF.filePath, 'application/pdf', dataPDF.fileName, dataPDF);
        }).catch(next)
};

const upsert = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.upsert(req.body)
        .then(response => {
            if (response) {
                success({ req, res, status: 201 });
            } else {
                next(response);
            }
        }).catch(next)
}

const remove = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.remove(Number(req.params.id))
        .then(() => {
            success({ req, res });
        }).catch(next)
}

const get = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.getProvider(Number(req.params.id))
        .then((data) => {
            success({ req, res, message: data });
        }).catch(next)
}

const getDataFiscal = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.getDataFiscal(Number(req.query.cuit))
        .then((data) => {
            success({ req, res, message: data });
        }).catch(next)
}

router
    .get("/details/:id", secure(EPermissions.providers), get)
    .get("/fiscal", secure(EPermissions.providers), getDataFiscal)
    .get("/pdf", secure(EPermissions.providers), listPDF)
    .get("/:page", secure(EPermissions.providers), listPagination)
    .get("/", secure(EPermissions.providers), list)
    .post("/", secure(EPermissions.providers), upsert)
    .put("/", secure(EPermissions.providers), upsert)
    .delete("/:id", secure(EPermissions.providers), remove);

export = router;