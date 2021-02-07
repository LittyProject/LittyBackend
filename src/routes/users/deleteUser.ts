import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import { messages } from "../../models/responseMessages";
import {guildMemberSchema} from "../../models/user";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(user) {
            if(req.params.id == "@me" && req.params.id == req.user.id) {
                // delete account.
                return res.success();
            }
            return res.error(messages.UNAUTHORIZED);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
