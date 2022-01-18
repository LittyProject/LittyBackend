import express from 'express';
import db from "../../db";
import * as f from '../../functions';
import {emit} from "../../functions";
import {messages} from "../../models/responseMessages";
import {Role, roleEditSchema} from "../../models/role";
import {defaultPerms, Permission} from "../../models/permission";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();
        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            const roles = await db.getServerRoles(server.id);
            let member = await db.getMember(req.user.id, server.id);
            if(!member) return res.notFound();
            let userRole = await db.getMemberRoles(req.user.id, req.params.id);
            // @ts-ignore
            if(!userRole[0].perms.find((a: Permission) => a.name === "MANAGE_ROLES").type && server.ownerId !== req.user.id){
                return res.error(messages.FORBIDDEN);
            }
            if(roles.length >= 20){
                return res.error(messages.TOO_MUCH_ROLES);
            }
            let b = req.body;
            b.position = parseInt(b.position);
            if(!roleEditSchema.safeParse(b).success){
                return res.error(messages.INVALID_DATA);
            }
            let roleSchema = roleEditSchema.parse(b);
            const role : Role = {
                createdAt: new Date(),
                deleted: false,
                serverId: server.id,
                id: f.genID(),
                name: roleSchema.name,
                timestamp: new Date().getTime(),
                position: roleSchema.position,
                color: roleSchema.color,
                perms: defaultPerms()
            }

            await db.insertRole(role);
            emit(server.id, 'serverRoleCreate', role);
            return res.success(role);
        }
    } catch(err) {
        return res.error(err);
    }
}
