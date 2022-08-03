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
    function base64_encode(file: any) {
        // read binary data
        var bitmap: Buffer = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return Buffer.from(bitmap).toString('base64');
    }

    const myCss = fs.readFileSync(path.join("public", "css", "style.css"), 'utf8')
    let logo64 = base64_encode(path.join("public", "images", "logo_long.png"))

    const datos2 = {
        myCss: `<style>${myCss}</style>`,
        date: "25/07/2022",
        paymentNumber: "0001-00000014",
        providerName: "RETONDO JAVIER EDGARDO",
        dni: "35092514",
        type: "TIPO DE PRUEBA",
        periods: ["JULIO/2022", "AGOSTO/2022"],
        amount: "25.236,45",
        details: "dagdagdsgdsgds sdgsd  esg s r gs gsg segsewgewsg esgewsrg ",
        logo: 'data:image/png;base64,' + logo64,
        title: "PAGO DE ADELANTO"
    }

    res.render('reports/payments/Advance.ejs', datos2);


}

router
    .get("/payment", newAdvance)

export = router;