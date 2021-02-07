import express from 'express';
import db from "../../db";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const servers = await db.getUserServers(req.params.id == "@me" ? req.user.id : req.params.id);
        if(!servers) {
            return res.notFound();
        } else {
            res.success(servers);
        }
    } catch(err) {
        return res.error(err);
    }
}
