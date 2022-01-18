import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import {exportUserSchema} from "../../models/user";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(user) {
            if(req.params.id !== "@me" && req.params.id !== req.user.id) {
                let model = await f.getOnlyByZod(user, exportUserSchema);
                return res.success(model);
            } else {
                let model = await f.without(user, 'password token email');
                return res.success(model);
            }
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
