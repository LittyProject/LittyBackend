import express from 'express';
import db from "../../db";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let servers = []
        if(req.params.id == "@me") {
            servers = await db.getUserServers(req.user.id);
        } else {
            servers = await db.getSharedServers(req.params.id, req.user.id);
        }

        res.success(servers);
    } catch(err) {
        return res.error(err);
    }
}
