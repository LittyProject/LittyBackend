import express from 'express';
import { updateFlags } from "../../models/server";
import db from "../../db";
import {SocketServer} from "../../app";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let server = await db.getServer(req.params.id);
        if(server) {
            let model = updateFlags.parse(req.body);
            server = Object.assign(server, model);
            await db.updateServer(server);
            SocketServer.to(server.id).emit('serverFlagUpdate', model);
            return res.success(model);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
