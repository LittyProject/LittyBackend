import express from 'express';
import db from "../../db";
import {Channel, channelEditSchema, channelSchema} from "../../models/server";
import {Invite, inviteSchema} from "../../models/invite";
import * as f from '../../functions';
import {SocketServer} from "../../app";
import {emit} from "../../functions";

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
            server.roles = server.roles.sort(function(a: any, b: any){return b.position - a.position});
            // @ts-ignore
            let userRole = server.roles.find((a: any)=> a.members.includes(req.user.id));
            if(!userRole){
                return res.error("Error with member roles");
            }
            // @ts-ignore
            if(!userRole.perms.find((a: any)=> a.name==="CREATE_INVITES").type&&server.ownerId !==req.user.id){
                return res.error("you are not has permission to that");
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
            emit(server.id, 'serverInviteCreate', {id: server.id, data: invite});
            return res.success(invite);
        }
    } catch(err) {
        return res.error(err);
    }
}