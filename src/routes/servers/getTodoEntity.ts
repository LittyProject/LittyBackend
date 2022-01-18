import express from 'express';
import db from "../../db";
import {Channel} from "../../models/channel";
import {messages} from "../../models/responseMessages";


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
            if(channel.type !=4){
                return res.error(messages.ENTITY_INVALID_CHANNEL);
            }
            const e = await db.getEntities(channel.id, 'todo', false);
            return res.success(e);
        }
    } catch(err) {
        return res.error(err);
    }
}
