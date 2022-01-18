import express from 'express';
import db from "../../db";
import {emit} from "../../functions";
import {messages} from "../../models/responseMessages";
import {Permission} from "../../models/permission";

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
            let roles = await db.getServerRoles(server.id);
            let member = await db.getMember(req.user.id, server.id);
            if(!member) return res.notFound();
            let userRole = await db.getMemberRoles(req.user.id, server.id);
            // @ts-ignore
            if(!userRole[0].perms.find((a: Permission) => a.name === "MANAGE_CHANNELS").type && server.ownerId !== req.user.id){
                return res.error(messages.FORBIDDEN);
            }

            const channels = await db.getServerChannels(server.id);
            let channel = channels.find(a => a.id === req.params.channel);
            if(!channel){
                return res.notFound();
            }

            await db.deleteChannel(channel);

            emit(server.id, 'serverChannelDelete', {id: server.id, data: channel});
            return res.success(channel);
        }
    } catch(err) {
        return res.error(err);
    }
}
