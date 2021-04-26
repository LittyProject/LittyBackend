import express from 'express';
import db from "../../db";
import {SocketServer} from "../../app";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.params.role) return res.notFound();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();

        let server = await db.getServer(req.params.id);
        if(server) {
            let role = server.roles.find(a=>a.id === req.params.role);
            if(!role){
                return res.notFound();
            }
            if(role.id===server.id){
                return res.forbridden();
            }
            if(req.body.member){
                if(role.members.includes(req.body.member)){
                    role.members.splice(role.members.findIndex(a=> a===req.body.member), 1);
                }else{
                    role.members.push(req.body.member);
                }
            }
            await db.updateServer(server);
            SocketServer.to(server.id).emit('serverRoleUpdate', {id: server.id, data: role});
            return res.success(role);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
