import express from 'express';
import * as f from '../../functions';
import db from "../../db";
import { messages } from '../../models/responseMessages';
import {exportUserSchema} from "../../models/user";
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import {ExportServer, Server} from "../../models/server";
import {ExportMember, exportMemberSchema, Member} from "../../models/member";
import {Role} from "../../models/role";
import {defaultPerms} from "../../models/permission";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if((await db.getUserServersCount(req.user.id)) >= 50) return res.error(messages.TOO_MUCH_SERVERS);
        if((await db.isUserInServer(req.user.id, req.params.id))) return res.error(messages.IN_SERVER);
        let server: Server | null = await db.getServer(req.params.id)
        if(server) {
            let role : Role | null = await db.getRole(server.id);
            if(!role){
                role = {
                    createdAt: new Date(),
                    deleted: false,
                    serverId: server.id,
                    id: server.id,
                    name: "everyone",
                    position: 1,
                    color: "#FCFCFC",
                    timestamp: new Date().getTime(),
                    perms: defaultPerms(),
                };
                await db.insertRole(role);
            }
            let member: Member = {
                id: `${server.id}-${req.user.id}`,
                joinedAt: new Date(),
                memberId: req.user.id,
                nickname: null,
                roles: [server.id],
                serverId: server.id
            };

            await db.insertMember(member);
            await db.giveMembersEveryoneRole(server.id);
            let model: ExportMember = await exportMemberSchema.parse(Object.assign(member, await db.getUser(member.memberId)));
            await emit(server.id, "serverMemberJoin", {serverId: server.id, memberId: `${req.user.id}`, data: model});
            let exportServer: ExportServer | null = await db.getExportServer(server.id);

            emit(req.user.id, "serverCreate", exportServer);
            SocketServer.sockets.sockets.forEach((socket : any)=>{
                // @ts-ignore
                if(socket.id === req.user.id){
                    socket.join(server?.id);
                }
            });
            return res.success(exportServer);
        }
        return res.notFound();
    } catch(err) {
        console.log(err);
        return res.error(err);
    }
}
