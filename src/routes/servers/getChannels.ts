import express from 'express';
import db from "../../db";
import {ExportChannel} from "../../models/channel";

// Example:
// -> With messages
// GET /api/servers/:id/channels?withMessages=true
//
// -> WithoutMessages
// GET /api/servers/:id/channels

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();

        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            let channels = await db.getServerChannels(server.id);
            if(req.query.withMessages && channels.length > 0) {
                const exportChannels: ExportChannel[] = [];
                for (let channel of channels) {
                    let ch: ExportChannel = channel;
                    ch.messages = await db.getMessages(server.id, ch.id, Date.now());
                    exportChannels.push(ch);
                }
                return res.success(exportChannels);
            } else {
                return res.success(channels);
            }
        }
    } catch(err) {
        return res.error(err);
    }
}
