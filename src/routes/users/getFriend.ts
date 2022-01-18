import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import {exportUserSchema} from "../../models/user";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(user) {
            if(user.friends.includes(req.params.userId) || user.friendRequests.includes(req.params.userId)) {
                const friend = await db.getUser(req.params.userId);
                if(friend) {
                    let model = await f.getOnlyByZod(friend, exportUserSchema);
                    return res.success(model);
                }
            }
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
