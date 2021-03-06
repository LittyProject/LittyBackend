import express from 'express';
import db from "../../db";
import {Message, messageSchema} from "../../models/messages";
import {messages} from "../../models/responseMessages";
import * as f from "../../functions";
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
            let d = [];
            if(req.query.after){
                d = await db.getMessages(server.id, channel.id, Number.parseInt(<string>req.query.after));
            }else{
                d = await db.getMessagesFirst(server.id, channel.id);
            }
            return res.success(d);
        }
    } catch(err) {
        return res.error(err);
    }
}
