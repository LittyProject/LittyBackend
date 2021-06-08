import express from 'express';
import * as f from '../../functions';
import db from "../../db";
import checkOnServer from "../../middlewares/checkOnServer";
import isBannedOnServer from '../../middlewares/isBannedOnServer';
import { messages } from '../../models/responseMessages';
import {guildMemberSchema} from "../../models/user";
import {SocketServer} from "../../app";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();

        let server: any = await db.getServerWithMembers(req.params.id);
        if(server) {
            if(!req.user.servers.includes(server.id)){
                return res.error("You are noy in this server")
            }
            req.user.servers = req.user.servers.slice(req.user.servers.findIndex(b=> b===server.id), 1);
            await db.updateUser({id: req.user.id, servers: req.user.servers});
            let roles = server.roles;
            roles.filter((a : any)=> a.members.includes(req.user?.id)).map((b: any)=>{
                b.members = b.members.slice(b.members.findIndex((b: any)=> b===req.user?.id), 1);
            });
            await db.updateServer({id: server.id, roles: roles});
            let member = await f.getOnlyByZod(req.user, guildMemberSchema);
            await f.emit(server.id, "serverMemberLeave", {server: server.id, member: member});
            roles.forEach((a: any)=> emit(server.id, 'serverRoleUpdate', {id: server.id, data: a}));
            await f.emit(req.user.id, "serverDelete", server);
            SocketServer.sockets.sockets.forEach((socket : any)=>{
                // @ts-ignore
                if(socket.id===req.user.id){
                    socket.leave(server.id);
                }
            });
            return res.success();
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}