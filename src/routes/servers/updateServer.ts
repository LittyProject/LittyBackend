import express from 'express';
import db from "../../db";
import {updateServer} from "../../models/payload";
import {SocketServer} from "../../app";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();

        let server: any = await db.getServer(req.params.id);
        const flags = server.flags;
        server.roles = server.roles.sort(function(a: any, b: any){return b.position - a.position});
        // @ts-ignore
        let userRole = server.roles.find((a: any)=> a.members.includes(req.user.id));
        if(!userRole){
            return res.error("Error with member roles");
        }
        // @ts-ignore
        if(!userRole.perms.find((a: any)=> a.name==="MANAGE_SERVER").type&&server.ownerId !==req.user.id){
            return res.error("you are not has permission to that");
        }
        if(!server) {
            return res.notFound();
        }
        if(!updateServer.check(req.body)){
            return res.error("invalid data");
        }
        let parse = updateServer.parse(req.body);
        let a = Object.assign(server, parse);
        if(!req.user.flags.includes('DEVELOPER')){
            a.flags=flags;
        }
        await db.updateServer({id: server.id, ...a});
        SocketServer.to(server.id).emit('serverUpdate', {id: server.id, data: a});
        return res.success(a);
    } catch(err) {
        return res.error(err);
    }
}
