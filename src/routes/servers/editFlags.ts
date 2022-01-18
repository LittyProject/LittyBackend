import express from 'express';
import {Server, updateFlags} from "../../models/server";
import db from "../../db";
import {SocketServer} from "../../app";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let server: Server | null = await db.getServer(req.params.id);
        if(server) {
            let model = updateFlags.parse(req.body);
            server = Object.assign(server, model);
            await db.updateServer(server);
            SocketServer.to(server.id).emit('serverUpdate', server);
            return res.success(model);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
