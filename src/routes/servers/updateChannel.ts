import express from 'express';
import db from "../../db";
import {updateChannel} from "../../models/payload"
import {SocketServer} from "../../app";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.params.channel) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();
        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            let channel = server.channels.find(a=>a.id === req.params.channel);
            if(!channel){
                return res.notFound();
            }
            if(!updateChannel.check(req.body)){
                return res.error("invalid data");
            }
            channel.name = req.body.name;
            await db.updateServer({id: server.id, channels: [...server.channels]});
            SocketServer.to(server.id).emit('serverChannelUpdate', {id: server.id, data: channel});
            return res.success(channel);
        }
    } catch(err) {
        return res.error(err);
    }
}
