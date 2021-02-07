import express from 'express';
import db from "../../db";
import * as f from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(!user) {
            return res.notFound();
        } else {
            if(req.params.id !== "@me" && req.params.id !== req.user.id) {
                let model = await f.getOnly(user, 'id username avatarURL banned bot status customStatus badges deleted tag');
                return res.success(model);
            } else {
                let model = await f.without(user, 'password token');
                return res.success(model);
            }
        }
    } catch(err) {
        return res.error(err);
    }
}
