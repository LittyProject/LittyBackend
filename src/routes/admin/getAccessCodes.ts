import express from 'express';
import db from "../../db";
import * as f from '../../functions';
import {emit} from "../../functions";
import { AccessCode } from '../../models/accessCode';
import { messages } from '../../models/responseMessages';

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized();
        const code = await db.getCodes();
        return res.success(code)
    } catch(err) {
        return res.error(err);
    }
}