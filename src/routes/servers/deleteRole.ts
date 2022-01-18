import express from 'express';
import db from "../../db";
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import {Permission} from "../../models/permission";
import {messages} from "../../models/responseMessages";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.params.role) return res.notFound();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();
        console.log('check server');
        let server = await db.getServer(req.params.id);
        if(server) {
            console.log(req.params.role);
            let roles = await db.getServerRoles(server.id, false);
            let member = await db.getMember(req.user.id, server.id);
            // @ts-ignore
            let userRole = await db.getMemberRoles(req.user.id, server.id);
            // @ts-ignore
            if(!userRole[0].perms.find((a: Permission) => a.name === "MANAGE_ROLES").type && server.ownerId !== req.user.id){
                return res.error(messages.FORBIDDEN);
            }
            let role = roles.find(a => a.id === req.params.role);
            console.log(role);
            console.log(roles);
            if(!role){
                return res.notFound();
            }
            if(role.id === server.id){
                return res.forbidden();
            }
            console.log('here');
            await db.deleteRole(role);
            emit(server.id, 'serverRoleDelete', {id: server.id, data: role});
            return res.success(role);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
