import express from 'express';
import db from "../../db";
import {Server} from "../../models/server";
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import {Role, roleEditSchema} from "../../models/role";
import {Permission, addNonePerms} from "../../models/permission";
import {messages} from "../../models/responseMessages";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.params.role) return res.notFound();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();

        let server : Server | null = await db.getServer(req.params.id);
        if(server) {
            let userRole = await db.getMemberRoles(req.user.id, req.params.id);
            // @ts-ignore
            if(!userRole[0].perms.find((a: Permission) => a.name === "MANAGE_ROLES").type && server.ownerId !== req.user.id){
                return res.error(messages.FORBIDDEN);
            }
            let role : Role | null = await db.getRole(req.params.role);
            if(!role){
                return res.notFound();
            }
            if(!roleEditSchema.safeParse(req.body).success){
                return res.error(messages.INVALID_DATA);
            }
            role = Object.assign(role, roleEditSchema.parse(req.body));
            role.perms = addNonePerms(role.perms);
            await db.updateRole(role);
            emit(server.id, 'serverRoleUpdate', role);
            return res.success(role);
        }
        return res.notFound();
    } catch(err) {
        console.log(err);
        return res.error(err);
    }
}
