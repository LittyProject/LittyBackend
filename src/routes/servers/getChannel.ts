import express from 'express';
import db from "../../db";
import {ExportChannel} from "../../models/channel";

// Example:
// -> With messages
// GET /api/servers/:id/channels/:channel?withMessages=true
//
// -> WithoutMessages
// GET /api/servers/:id/channels/:channel

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.params.channel) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();

        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            let channel = await db.getChannel(req.params.channel);
            if(!channel){
                return res.notFound();
            }
            if(req.query.withMessages) {
                const ch: ExportChannel = channel;
                ch.messages = await db.getMessages(server.id, ch.id, Date.now());
                return res.success(ch);
            } else {
                return res.success(channel);
            }
        }
    } catch(err) {
        return res.error(err);
    }
}
