import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https'

dotenv.config({
    path: path.join(__dirname, "..", "..", ".env")
});

import { errorTrhow } from '../network/errors';

import test from './components/test';
import auth from './components/auth/network';
import permissions from './components/permissions/network';
import user from './components/user/network';
import routes from './components/routes/network';
import activity from './components/activity/network';
import providers from './components/providers/network';
import sectors from './components/sectors/network';
import amounts from './components/amount/network';
import payments from './components/payments/network';
export class App {
    app: Application;
    constructor(
        private port: number | string
    ) {
        this.app = express();
        this.settings();
        this.middlewares();
        this.routes();
    }

    private settings() {
        this.app.set('port', this.port);
        this.app.set('views', path.join('views'));
        this.app.set('view engine', 'ejs');
    }

    private middlewares() {
        this.app.use(cors({
            exposedHeaders: ['Content-Disposition']
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private routes() {
        this.app.use("/static", express.static(path.join(__dirname, "..", "..", "public")));
        this.app.use('/api', test);
        this.app.use("/api/auth", auth)
        this.app.use("/api/permissions", permissions)
        this.app.use("/api/user", user)
        this.app.use("/api/routes", routes)
        this.app.use("/api/activity", activity)
        this.app.use("/api/providers", providers)
        this.app.use("/api/sectors", sectors)
        this.app.use("/api/amounts", amounts)
        this.app.use("/api/payments", payments)
        this.app.use(errorTrhow);
    }

    listenTest(): void {
        this.app.listen(this.app.get('port'));
        console.log(`Conectado al puerto ${this.app.get('port')}`)
    }

    listenProd(): void {
        var options = {
            key: fs.readFileSync(path.join(__dirname, "..", "..", "..", "..", "..", "nekoadmin.key"), 'utf8'),
            cert: fs.readFileSync(path.join(__dirname, "..", "..", "..", "..", "..", "nekoadmin.crt"), 'utf8')
        };
        https.createServer(options, this.app).listen(this.app.get('port'), () => {
            console.log(`Conectado al puerto ${this.app.get('port')}`)
        });
    }
}