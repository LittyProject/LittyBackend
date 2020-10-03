import express from 'express';
import db from "../../db";
import * as f from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();

        const user = await db.getUser(req.params.id);
        if(!user) {
            return res.notFound();
        } else {
            let model = await f.getOnly(user, 'id username avatarURL banned bot status customStatus badges deleted');
            return res.success(model);
        }
    } catch(err) {
        return res.error(err);
    }
}