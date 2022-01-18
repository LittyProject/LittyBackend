import express from 'express';
import db from "../../db";
import {messages} from "../../models/responseMessages";
import {exportUserSchema} from "../../models/user";
import isBannedOnServer from "../../middlewares/isBannedOnServer";
import {SocketServer} from "../../app";
import * as f from '../../functions';
import {Member} from "../../models/member";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.code) return res.notFound();
        if(!req.user) return res.notAuthorized();
        const userServers = await db.getUserServersCount(req.user.id);
        if(userServers >= 50) return res.error(messages.TOO_MUCH_SERVERS);

        let invite = await db.getInvite(req.params.code);
        if(!invite) return res.notFound();
        let server = await db.getExportServer(invite.serverId);
        let members = await db.getServerMembers(invite.serverId);
        if(!server || !members) return res.notFound();
        // @ts-ignore
        if(await db.isUserInServer(req.user.id, req.params.id)) return res.error("You are in this server");

        const member: Member = {
            id: `${server.id}-${req.user.id}`,
            joinedAt: new Date(),
            memberId: req.user.id,
            nickname: "",
            roles: [`${server.id}`],
            serverId: server.id
        };

        await db.insertMember(member);

        let memberData = await f.getOnlyByZod(req.user, exportUserSchema);
        await SocketServer.to(server.id).emit("serverMemberJoin", {serverId: server.id, memberId: member});
        await SocketServer.to(req.user.id).emit("createServer", server);
        return res.success();
    } catch(err) {
        console.log(err);
        return res.error(err);
    }
}
