import express from 'express';
import db from "../../db";
import {Channel} from "../../models/channel";
import {messages} from "../../models/responseMessages";

// Example:
// -> Get first messages
// GET /api/servers/:id/channels/:channel/messages
//
// -> Get last messages
// GET /api/servers/:id/channels/:channel/messages?after=TIMESTAMP_IN_MS
//
// -> Get last messages
// GET /api/servers/:id/channels/:channel/messages?lastMessages=true

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.params.channel) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.error(messages.NOT_IN_SERVER);

        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            let channel : Channel | null = await db.getChannel(req.params.channel);
            if(!channel){
                return res.notFound();
            }
            let d = [];
            if(req.query.after){
                d = await db.getMessages(server.id, channel.id, Number.parseInt(<string>req.query.after));
            } else if(req.query.lastMessages){
                d = await db.getLastMessages(server.id, channel.id);
            } else {
                d = await db.getMessagesFirst(server.id, channel.id);
            }
            return res.success(d);
        }
    } catch(err) {
        return res.error(err);
    }
}
