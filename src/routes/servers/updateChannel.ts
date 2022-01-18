import express from 'express';
import db from "../../db";
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import {Channel, channelEditSchema} from "../../models/channel";
import {Permission} from "../../models/permission";
import {messages} from "../../models/responseMessages";

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
            let userRole = await db.getMemberRoles(req.user.id, req.params.id);
            // @ts-ignore
            if(!userRole[0].perms.find((a: Permission) => a.name === "MANAGE_CHANNELS").type && server.ownerId !== req.user.id){
                return res.error(messages.FORBIDDEN);
            }
            let channel : Channel | null = await db.getChannel(req.params.channel);
            if(!channel){
                return res.notFound();
            }
            if(!channelEditSchema.safeParse(req.body).success){
                return res.error(messages.INVALID_DATA);
            }
            let newC = channelEditSchema.parse(req.body);
            if(channel.type !=4){
                if(newC.label&&newC.label.length>0){
                    return res.error(messages.ENTITY_INVALID_CHANNEL);
                }
            }
            channel = Object.assign(channel, newC);
            await db.updateChannel(channel);
            emit(server.id, 'serverChannelUpdate', channel);
            return res.success(channel);
        }
    } catch(err) {
        return res.error(err);
    }
}
