import express from 'express';
import db from "../../db";
import {SocketServer} from "../../app";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();
        let server: any = await db.getServer(req.params.id);
        if(server) {
            if(req.user.id !== server.ownerId){
                return res.error("You're not owner");
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
