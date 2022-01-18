import express from 'express';
import db from "../../db";
import {Invite} from "../../models/invite";
import * as f from '../../functions';
import {emit} from "../../functions";
import {messages} from "../../models/responseMessages";
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
            const invites = await db.getServerInvitesCount(server.id);
            let roles = await db.getServerRoles(server.id);
            let member = await db.getMember(req.user.id, server.id);
            // @ts-ignore
            let userRole = roles.filter(r => member?.roles.includes(r.id)).first();
            if(!userRole){
                return res.error("Error with member roles");
            }
            // @ts-ignore
            if(!userRole.perms.find((a: Permission)=> a.name === "CREATE_INVITES").type && server.ownerId !== req.user.id){
                return res.error(messages.FORBIDDEN);
            }
            if(invites >= 50){
                return res.error(messages.TOO_MUCH_INVITES);
            }
            let code = f.genID();
            let time;
            switch(req.body?.time){
                case '3d':
                    time = new Date().getTime() + 3 * 24 * 60 * 60 * 1000;
                    break;
                case '7d':
                    time = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
                    break;
                case '14d':
                    time = new Date().getTime() + 14 * 24 * 60 * 60 * 1000;
                    break;
                case '30d':
                    time = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
                    break;
                case 'unlimited':
                default:
                    time = 64060588800000;
                    break;
            }
            const invite : Invite = {
                inviterId: req.user.id,
                id: f.genID(),
                code: code,
                serverId: server.id,
                timestampCreated: new Date().getTime(),
                timestampEnd: time
            }
            await db.insertInvite(invite);
            emit(server.id, 'serverInviteCreate', {id: server.id, data: invite});
            return res.success(invite);
        }
    } catch(err) {
        return res.error(err);
    }
}
