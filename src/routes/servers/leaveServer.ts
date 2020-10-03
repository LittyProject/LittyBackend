import express from 'express';
import * as f from '../../functions';
import db from "../../db";
import checkOnServer from "../../middlewares/checkOnServer";

export default async function(req: express.Request, res: express.Response) {
    if(!req.user) return res.notAuthorized();
    if(req.user.servers.length >= 50) return res.error("too much servers on");

    if(!checkOnServer(req.user, req.params.id)) return res.notFound;

    req.user.servers = req.user.servers.filter(x => x !== req.params.id);
    await db.updateUser(req.user);
    return res.success();
}