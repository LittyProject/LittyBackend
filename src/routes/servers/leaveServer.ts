import express from 'express';
import db from "../../db";
import checkOnServer from "../../middlewares/checkOnServer";
import { messages } from '../../models/responseMessages';

export default async function(req: express.Request, res: express.Response) {
    if(!req.user) return res.notAuthorized();
    if(req.user.servers.length >= 50) return res.error(messages.TOO_MUCH_SERVERS);

    if(!checkOnServer(req.user, req.params.id)) return res.notFound;

    const server = await db.getServer(req.params.id);
    if(!server) {
        req.user.servers = req.user.servers.filter(x => x !== req.params.id);
        await db.updateUser(req.user);
        return res.success();
    }
    if(server.ownerId == req.user.id) return res.error(messages.SERVER_OWNER);

    req.user.servers = req.user.servers.filter(x => x !== req.params.id);
    await db.updateUser(req.user);
    return res.success();
}