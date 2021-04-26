import express from 'express';
import db from "../../db";
import {Channel, channelEditSchema, channelSchema} from "../../models/server";
import {Invite, inviteSchema} from "../../models/invite";
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
            if(!server.invites){
                server.invites=[];
            }
            if(server.invites?.length===50){
                return res.error("Server can only have 50 invites");
            }
            let code = f.genID();
            const invite : Invite = {
                inviterId: "",
                id: f.genID(),
                code: code,
                serverId: server.id,
                timestampCreated: new Date().getTime()
            }
            server.invites.push(invite.id);
            await db.updateServer(server);
            await db.insertInvite(invite);
            SocketServer.to(server.id).emit('serverInviteCreate', {id: server.id, data: invite});
            return res.success(invite);
        }
    } catch(err) {
        return res.error(err);
    }
}