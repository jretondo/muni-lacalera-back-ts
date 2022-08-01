import { Router, NextFunction, Response, Request } from 'express';
import { sendPass } from '../../../utils/sendEmails/sendPass';
import fs from 'fs';
import path from 'path';
import utf8 from 'utf8';
import base64 from 'base-64';
import { Error } from 'tinify/lib/tinify/Error';
import moment from 'moment';
import { file } from '../../../network/response';
import ejs from 'ejs';
import pdf from 'html-pdf';
import JsReport from 'jsreport';
import { promisify } from 'util';

const router = Router();

const newAdvance = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const myCss = fs.readFileSync(path.join("public", "css", "style.css"), 'utf8')
    const datos2 = {
        myCss: `<style>${myCss}</style>`,
        date: "25/07/2022",

    }

    res.render('payment/Advance.ejs', datos2);


}

router
    .get("/payment", newAdvance)

export = router;