import bodyParser from "body-parser";
import { Router } from "express";
import Conversation, { ConversationType } from "../models/conversation.model";

import jwt from 'jsonwebtoken';
import config from '../../config';
import User from "../models/user.model";
import { ObjectId } from "mongodb";
import { AggregatePaginateResult } from "mongoose";

const ConversationController = Router();

ConversationController.use(bodyParser.urlencoded({extended: false}));
ConversationController.use(bodyParser.json());

ConversationController.get('/', async (req: any, res: any) => {
    try {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).send({auth: false, message: 'No token provided.'});
        }
        jwt.verify(token, config.secret, async (err: any, decoded: any) => {
            if (err) {
                return res.status(500).send({auth: false, message: 'Wrong token'});
            }
            try {
                const user = await User.findById(decoded.id, {password: 0});

                const conversationsIds = user.conversations;
                
                const pipeline = [{$match: {_id: {$in: conversationsIds}}}];
                const aggregateQuery = Conversation.aggregate(pipeline);

                const conversations = await Conversation.aggregatePaginate (
                    aggregateQuery,
                    {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 10
                    }
                )
                return res.status(200).send(conversations); 
            } catch (err) {
                return res.status(500).send('There was a problem finding the user');
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send('There was a problem fetching conversations');
    }
})

ConversationController.post('/create', async (req: any, res: any) => {
    try {
        const conversationToCreate = await Conversation.create({
            title: req.body.title,
            creationDate: req.body.creationDate,
            conversation: [
                {
                    prompt: req.body.prompt,
                    response: req.body.response
                }
            ]
        });
        console.log('Conversation to add =>', conversationToCreate);
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).send({auth: false, message: 'No token provided.'});
        }
        jwt.verify(token, config.secret, async (err: any, decoded: any) => {
            if (err) {
                return res.status(500).send({auth: false, message: 'Wrong token'});
            }
            try {
                const conversationId = conversationToCreate._id;
                await User.updateOne({
                    _id: new ObjectId(decoded.id)
                }, 
                {
                    $addToSet: {
                        conversations: conversationId
                    }
                });
            } catch (err) {
                return res.status(500).send('There was a problem finding the user');
            }
        })
        return res.status(200).send('Conversation added to the DB');
    } catch (err) {
        console.error(err);
        return res.status(500).send('Error while adding the conversation to the dataBase');
    }
})

export default ConversationController;