import express from 'express';
import * as f from '../../functions';
import db from "../../db";
import checkOnServer from "../../middlewares/checkOnServer";
import isBannedOnServer from '../../middlewares/isBannedOnServer';
import { messages } from '../../models/responseMessages';

export default async function(req: express.Request, res: express.Response) {
    if(!req.user) return res.notAuthorized();
    if(req.user.servers.length >= 50) return res.error(messages.TOO_MUCH_SERVERS);

    if(checkOnServer(req.user, req.params.id)) return res.success();

    let srv = await db.getServer(req.params.id);
    if(!srv) return res.notFound;

    if(isBannedOnServer(req.user, req.params.id)) return res.status(404).json({reason: srv.banList.filter(x => x.id == req.user?.id)[0].reason !== "" ? srv.banList.filter(x => x.id == req.user?.id)[0].reason : messages.BANNED});
    
    req.user.servers.push(req.params.id);
    await db.updateUser(req.user);
    return res.success();
}