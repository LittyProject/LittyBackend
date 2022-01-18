import express from 'express';
import db from "../../db";
import * as f from '../../functions';
import {emit} from "../../functions";
import { AccessCode } from '../../models/accessCode';
import { messages } from '../../models/responseMessages';

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized();
        if(!req.params.code) return res.error(messages.INVALID_DATA);
        const code = await db.getCode(req.params.code);
        if(!code){
            return res.json(messages.NOT_FOUND);
        }
        await db.deleteCode(code);
        return res.success(code)
    } catch(err) {
        return res.error(err);
    }
}