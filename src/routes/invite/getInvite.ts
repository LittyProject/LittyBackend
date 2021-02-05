import express from 'express';
import db from "../../db";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();

        let invite = await db.getInvite(req.params.id);
        if(!invite) {
            return res.notFound();
        } else {
            return res.success(invite);
        }
    } catch(err) {
        return res.error(err);
    }
}