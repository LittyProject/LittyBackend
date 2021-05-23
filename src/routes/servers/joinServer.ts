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
            if(req.user.servers.includes(server.id)){
                return res.error("You are this server")
            }
            req.user.servers.push(server.id);
            await db.updateUser({id: req.user.id, servers: req.user.servers});
            let roles = server.roles;
            roles.find((a : any)=> a.id===server.id).members.push(req.user.id);
            await db.updateServer({id: server.id, roles: roles});
            let member = await f.getOnlyByZod(req.user, guildMemberSchema);
            await f.emit(server.id, "serverMemberJoin", {server: server.id, member: member});
            emit(server.id, 'serverRoleUpdate', {id: server.id, data: roles.find((a : any)=> a.id===server.id)});
            await f.emit(req.user.id, "serverCreate", server);
            SocketServer.sockets.sockets.forEach((socket : any)=>{
                // @ts-ignore
                if(socket.id===req.user.id){
                    socket.join(server.id);
                }
            });
            return res.success();
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}