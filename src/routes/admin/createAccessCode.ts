import express from 'express';
import db from "../../db";
import * as f from '../../functions';
import {emit} from "../../functions";
import { AccessCode } from '../../models/accessCode';
import { messages } from '../../models/responseMessages';

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized();
        const created = Date.now();
        let left = created;
        if(req.body.day){
            left = left+(86400000*req.body.day);
        }
        if(req.body.hours){
            left = left+(3600000*req.body.hours);
        }
        if(req.body.minutes){
            left = left+(60000*req.body.minutes);
        }
        if(created === left){
            return res.error(messages.INVALID_DURATION_CODE);
        }
        const code : AccessCode = {
            id: f.createID(8),
            timestamp: created,
            reedem: false,
            end: left,
        }
        await db.insertCode(code);
        return res.success(code)
    } catch(err) {
        return res.error(err);
    }
}