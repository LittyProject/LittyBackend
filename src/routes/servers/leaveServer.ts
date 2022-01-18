import express from 'express';
import * as f from '../../functions';
import db from "../../db";
import {memberSchema, Member, ExportMember, exportMemberSchema} from "../../models/member";
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import {Server} from "../../models/server";
import {messages} from "../../models/responseMessages";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.error(messages.NOT_IN_SERVER);
        let server: Server | null = await db.getServer(req.params.id);
        if(server) {
            if(server.ownerId === req.user.id) return res.error(messages.SERVER_OWNER);
            const member : Member | null = await db.getMember(req.user.id, server.id);
            if(!member || member === null){
                return res.error(messages.NOT_FOUND);
            }
            await db.deleteMember(member);
            let model: ExportMember = await exportMemberSchema.parse(Object.assign(member, await db.getUser(req.user.id)));
            emit(server.id, "serverMemberLeave", { server: server.id, member: `${req.user.id}`, data: model });
            console.log({ server: server.id, member: member.id, data: member });
            emit(req.user.id, "serverDelete", server);
            SocketServer.sockets.sockets.forEach((socket : any)=>{
                // @ts-ignore
                if(socket.id===req.user.id){
                    socket.leave(server?.id);
                }
            });
            return res.success();
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}