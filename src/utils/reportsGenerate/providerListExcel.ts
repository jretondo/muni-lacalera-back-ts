import { staticFolders } from './../../enums/EStaticFiles';
import fs from 'fs';
import path from 'path';
import { Error } from 'tinify/lib/tinify/Error';
import ejs from 'ejs';
import JsReport from 'jsreport-core';
import { promisify } from 'util';
import { IProviders } from 'interfaces/Itables';
import XLSX from 'xlsx';

export const createProviderListExcel = async (
    providerList: Array<IProviders>
) => {
    return new Promise(async (resolve, reject) => {
        const dataExcel = XLSX.utils.json_to_sheet(providerList)
        const workBook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workBook, dataExcel, "Hoja1")
        const fileName = "Lista Monotributistas.xlsx"
        const location = path.join(staticFolders.reportsExcel, fileName)
        XLSX.writeFile(workBook, location, { type: "file", bookType: "xlsx", sheet: "Hoja1" });

        const dataFact = {
            filePath: location,
            fileName: fileName
        }
        resolve(dataFact)
    })
}