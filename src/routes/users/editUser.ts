import express from 'express';
import { userUpdate, User } from "../../models/user";
import db from "../../db";
import * as f from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(!user) {
            return res.notFound();
        } else {
            let model = userUpdate.parse(req.body);
            user = Object.assign(user, model);
            await db.updateUser(user);
            return res.success(user);
        }
    } catch(err) {
        return res.error(err);
    }
}
