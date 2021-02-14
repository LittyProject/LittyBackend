import express from 'express';
import db from "../../db";
import {Channel, channelEditSchema} from "../../models/server";
import * as f from '../../functions';
import {SocketServer} from "../../app";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();

        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            if(server.channels.length===50){
                return res.error("Server can only have 50 channels");
            }
            if(!channelEditSchema.check(req.body)){
                return res.error("Invalid data");
            }
            let channelSchema = channelEditSchema.parse(req.body);
            const channel : Channel = {
                id: f.genID(),
                name: channelSchema.name,
                createdAt: new Date(),
            }
            server.channels.push(channel);
            await db.updateServer(server);
            SocketServer.to(server.id).emit('serverChannelCreate', {...channel, id: server.id});
            return res.success(channel);
        }
    } catch(err) {
        return res.error(err);
    }
}