import { NextFunction, Request, Response } from "express"
import { success } from '../../network/response';
import { config } from '../../config'
const express = require('express')
const router = express.Router()

//internal Functions
const test = (req: Request, res: Response, next: NextFunction) => {
    if (config.api.port === "3010") {
        success({ res: res, req: req, status: 200, message: "Bienvenido a la API de testeo de La Municipalidd de La Calera" });
    } else {
        success({ res: res, req: req, status: 200, message: "Bienvenido a la API de producción de La Municipalidd de La Calera" });
    }

}

//Routes
router.get("/", test)


export = router