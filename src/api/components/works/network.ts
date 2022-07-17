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
    Controller.getUser(Number(req.params.id))
        .then((data) => {
            success({ req, res, message: data });
        }).catch(next)
}

router
    .get("/details/:id", secure(EPermissions.works), get)
    .get("/:page", secure(EPermissions.works), listPagination)
    .get("/", secure(EPermissions.works), list)
    .post("/", secure(EPermissions.works), upsert)
    .put("/", secure(EPermissions.works), upsert)
    .delete("/:id", secure(EPermissions.works), remove);

export = router;