import express from 'express';
import db from "../../db";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized();
        const app = await db.getStaffMessageTo(req.user.id);
        return res.success(app)
    } catch(err) {
        return res.error(err);
    }
}