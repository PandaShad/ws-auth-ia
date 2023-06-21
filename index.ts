import express, { Express, Request, Response } from 'express';
import { Schema, model, connect } from 'mongoose';
import dotenv from 'dotenv';
import AuthController from './src/controllers/auth.controller';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8010;

const uri = process.env.MONGO_URI || '';
const prefix = '/api';

const authController = AuthController;

connect(uri)
    .then(() => {
        console.log('Connecté à la base MongoDB assignments dans le cloud !');
        console.log(`at URI = ${uri}`);
    },
    (err: any) => {
        console.log(`Erreur de connexion ${err}`);
    });

const headers = (req: any, res: { header: (arg0: string, arg1: string) => void; }, next: () => void) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
}
app.get(`${prefix}`, (req: Request, res: Response) => {
    res.send('Express + TypeScript Server');
  });

app.use(`${prefix}/auth`, headers, authController);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});