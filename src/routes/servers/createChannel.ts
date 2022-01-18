import express from 'express';
import db from "../../db";
import * as f from '../../functions';
import {emit} from "../../functions";
import {messages} from "../../models/responseMessages";
import {Channel, channelCreateSchema, channelEditSchema} from "../../models/channel";
import {Permission} from "../../models/permission";

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
            let userRole = await db.getMemberRoles(req.user.id, req.params.id);
            // @ts-ignore
            if(!userRole[0].perms.find(a=> a.name === 'ADMINISTRATOR').type){
                // @ts-ignore
                if(!userRole[0].perms.find(a=> ['MANAGE_CHANNELS'].includes(a.name)).type){
                    return res.error(messages.FORBIDDEN);
                }
            }
            if(channels.length >= 50){
                return res.error(messages.TOO_MUCH_CHANNELS);
            }
            if(!channelCreateSchema.safeParse(req.body).success){
                return res.error(messages.INVALID_DATA);
            }
            let channelSchema = channelCreateSchema.parse(req.body);
            if(!channelSchema) return res.error(messages.INVALID_DATA)
            const channel : Channel = {
                deleted: false,
                position: channels.length + 1,
                serverId: server.id,
                id: f.genID(),
                name: channelSchema.name,
                createdAt: new Date(),
                type: channelSchema.type
            };
            await db.insertChannel(channel);
            emit(server.id, 'serverChannelCreate', channel);
            return res.success(channel);
        }
    } catch(err) {
        return res.error(err);
    }
}
