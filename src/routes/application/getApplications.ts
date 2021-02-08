import express from 'express';
import db from "../../db";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const applications = await db.getUserApplications(req.user.id);
        return res.success(applications);
    } catch(err) {
        return res.error(err);
    }
}
