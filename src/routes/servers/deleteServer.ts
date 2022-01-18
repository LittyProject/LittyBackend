import express from 'express';
import db from "../../db";
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import {messages} from "../../models/responseMessages";
import {Server} from "../../models/server";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();
        let server: Server | null = await db.getServer(req.params.id);
        if(server) {
            if(req.user.id !== server.ownerId){
                return res.error(messages.NOT_SERVER_OWNER);
            }
            await db.deleteServer(req.params.id);
            emit(server.id, 'serverDelete', server);
            return res.success(server);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
