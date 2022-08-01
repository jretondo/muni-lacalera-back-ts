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
    Controller.upsert(req.body, req.body.isHealthProf)
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
    Controller.getUser(Number(req.params.id))
        .then((data) => {
            success({ req, res, message: data });
        }).catch(next)
}

const summaryWorks = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    Controller.summaryWorks(
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
    .get("/details/:id", secure(EPermissions.works), get)
    .get("/provider/:page", secure(EPermissions.works), provList)
    .get("/summary", secure(EPermissions.works), summaryWorks)
    .get("/:page", secure(EPermissions.works), listPagination)
    .get("/", secure(EPermissions.works), list)
    .post("/", secure(EPermissions.works), upsert)
    .put("/", secure(EPermissions.works), upsert)
    .delete("/:id", secure(EPermissions.works), remove);

export = router;