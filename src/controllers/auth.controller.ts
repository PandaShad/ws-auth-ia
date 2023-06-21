import { Router } from "express";
import User from "../models/user.model";
import bcrypt from 'bcrypt';

import jwt from 'jsonwebtoken';
import { IUser } from "src/types/user.type";

import config from '../../config';
import { VerifyTokenService } from '../services/verify-token.service';
import bodyParser from "body-parser";
import { Document } from "mongodb";
import { log } from "console";

const AuthController = Router();
const verifyTokenService = new VerifyTokenService();

AuthController.use(bodyParser.urlencoded({extended: false}));
AuthController.use(bodyParser.json());

AuthController.post('/register', async (req, res) => {
    try {
        const user: any = await User.findOne({
            email: req.body.email
        })
        if (user) {
            return res.status(409).send('A user with that email has already registerd. Please use a diffenrent email.')
        } else {
            let hashedPassword = bcrypt.hashSync(req.body.password, 8);
            try {
                const user = await User.create({
                    userName: req.body.userName,
                    email: req.body.email,
                    password: hashedPassword,
                    conversations: []
                });
                const token = jwt.sign({id: user._id}, config.secret, {
                    expiresIn: 86400
                });
                return res.status(200).send({auth: true, token: token})
            } catch (err) {
                return res.status(500).send('There was a problem registering the user');
            }
        }
    } catch (err) {
        console.error(err);
    }
})

AuthController.get('/me', verifyTokenService.verifyToken, (req: any, res: any) => {
    console.log(req.headers);
    const token = req.headers['authorization'];
    if(!token) {
        return res.status(401).send({auth: false, message: 'No token providerd.'});
    }
    jwt.verify(token, config.secret, async (err: any, decoded: any) => {
        if(err){
            return res.status(500).send({auth: false, message: 'Failed to authentificate'});
        }
        try {
            const user = await User.findById(decoded.id, {password: 0});
            if(!user) {
                return res.status(404).send('No user found');
            }
            res.status(200).send(user);
        } catch (err) {
            return res.status(500).send('There was a problem finding the user');
        }
    });
});

AuthController.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        });
        console.log(user);
        if(!user){
            return res.status(404).send('No user found');
        }
        let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
        if(!passwordIsValid) {
            return res.status(401).send({auth: false, token: null, message: 'Wrong email or password'});
        }
        let token = jwt.sign({id: user._id}, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        });

        const userData = {
            _id: user._id,
            userName: user.userName,
            email: user.email,
            conversations: user.conversations,
        };

        res.status(200).send({
            auth: true, 
            token: token, 
            expiresIn: 86400,
            user: userData
        });
    } catch (err) {
        return res.status(500).send('Error on the server');
    } 
});


AuthController.get('/logout', (req, res) => {
    res.status(200).send({auth: false, token: null});
});

export default AuthController;
