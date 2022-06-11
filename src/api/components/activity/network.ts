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
    Controller.upsert(req.body.user, req.body.activityDescr).then(resp=>{
        success({ req, res, message: resp })
    }).catch(next)
}

const list =(
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    Controller.list(
        Number(req.params.page),
        Number(req.query.userId),
        String(req.query.dateFrom),
        String(req.query.dateTo)
        ).then(dataList=>{
            success({ req, res, message: dataList })
        }).catch(next)
}

//Routes
router.get("/:page", secure(EPermissions.userAdmin), list)
    .post("/", secure(), upsert);
export = router;