import express from 'express';
import db from "../../db";
import {messages} from "../../models/responseMessages";
import {guildMemberSchema} from "../../models/user";
import isBannedOnServer from "../../middlewares/isBannedOnServer";
import {SocketServer} from "../../app";
import * as f from '../../functions';

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.code) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(req.user.servers.length >= 50) return res.error(messages.TOO_MUCH_SERVERS);

        let invite = await db.getInvite(req.params.code);
        if(!invite) return res.notFound();
        let server = await db.getServerWithMembers(invite.serverId);
        if(!server)return res.notFound();
        if(req.user.servers.includes(req.params.id)) return res.error("You are in this server");
        req.user.servers.push(invite.serverId);
        await db.updateUser(req.user);
        let roles = server.roles;
        roles.find((a : any)=> a.id===server.id).members.push(req.user.id);
        await db.updateServer({id: server.id, roles: roles});
        let member = await f.getOnlyByZod(req.user, guildMemberSchema);
        await SocketServer.to(server.id).emit("serverMemberJoin", {server: server.id, member: member});
        await SocketServer.to(req.user.id).emit("createServer", server);
        return res.success();
    } catch(err) {
        console.log(err);
        return res.error(err);
    }
}