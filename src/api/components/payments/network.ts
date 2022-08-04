import { file } from './../../../network/response';
import { EPermissions } from '../../../enums/EtablesDB';
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
    Controller.list(undefined, req.body.query)
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
        Number(req.query.month),
        Number(req.query.year),
        Number(req.query.sectorId),
        Boolean(req.query.advanceSearch)
    )
        .then((listData: any) => {
            success({ req, res, status: 200, message: listData });
        }).catch(next)
};

const provList = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.provList(
        Number(req.query.idProv),
        Number(req.params.page),
        Number(req.query.cantPerPage)
    )
        .then((listData: any) => {
            success({ req, res, status: 200, message: listData });
        }).catch(next)
};

const upsert = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.upsert(req.body)
        .then((dataFact) => {
            file(req, res, dataFact.filePath, 'application/pdf', dataFact.fileName, dataFact);
        })
        .catch(next)
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

const rePrintPDFPayment = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.rePrintPDFPayment(Number(req.params.id))
        .then((dataFact) => {
            file(req, res, dataFact.filePath, 'application/pdf', dataFact.fileName, dataFact);
        }).catch(next)
}

const summaryPayments = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.summaryPayments(
        Number(req.query.fromMonth),
        Number(req.query.fromYear),
        Number(req.query.toMonth),
        Number(req.query.toYear),
        String(req.query.idSector),
        String(req.query.idProvider)
    ).then((data) => {
        success({ req, res, message: data });
    }).catch(next)
}

router
    .get("/reprint/:id", secure(EPermissions.payments), rePrintPDFPayment)
    .get("/provider/:page", secure(EPermissions.payments), provList)
    .get("/summary", secure(EPermissions.payments), summaryPayments)
    .get("/:page", secure(EPermissions.payments), listPagination)
    .get("/", secure(EPermissions.payments), list)
    .post("/", secure(EPermissions.payments), upsert)
    .put("/", secure(EPermissions.payments), upsert)
    .delete("/:id", secure(EPermissions.payments), remove);

export = router;