import path from 'path';

export const staticFolders = {
    certAfip: path.join(__dirname, "..", "..", "public", "afip", "certs"),
    tokenAfip: path.join(__dirname, "..", "..", "public", "afip", "token"),
    css: path.join(__dirname, "..", "..", "public", "css"),
    images: path.join(__dirname, "..", "..", "public", "images"),
    reportsPdf: path.join(__dirname, "..", "..", "public", "reports", "pdf"),
    reposrtsExcel: path.join(__dirname, "..", "..", "public", "reports", "excel"),
}