import express from 'express';
import db from "../../db";
import {updateServer} from "../../models/payload";
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import {Permission} from "../../models/permission";
import {messages} from "../../models/responseMessages";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();

        let server: any = await db.getServer(req.params.id);
        const flags = server.flags;
        server.roles = server.roles.sort(function(a: any, b: any){return b.position - a.position});
        // @ts-ignore
        let userRole = await db.getMemberRoles(req.user.id, req.params.id);
        // @ts-ignore
        if(!userRole[0].perms.find((a: Permission) => a.name === "MANAGE_SERVER").type && server.ownerId !== req.user.id){
            return res.error(messages.FORBIDDEN);
        }
        if(!server) {
            return res.notFound();
        }
        if(!updateServer.safeParse(req.body).success){
            return res.error(messages.INVALID_DATA);
        }
        let parse = updateServer.parse(req.body);
        let a = Object.assign(server, parse);
        if(!req.user.flags.includes('DEVELOPER')){
            a.flags=flags;
        }
        await db.updateServer({id: server.id, ...a});
        emit(server.id, 'serverUpdate', a);
        return res.success(a);
    } catch(err) {
        return res.error(err);
    }
}
