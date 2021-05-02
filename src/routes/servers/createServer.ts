import {defaultPerms, Server, serverEditSchema} from "../../models/server";
import express from 'express';
import * as f from '../../functions';
import db from "../../db";
import { Message } from "../../models/messages";
import { messages } from "../../models/responseMessages";
import { SocketServer } from "../../app";
import socket from "socket.io";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized();
        if(req.user.servers.length >= 50) return res.error(messages.TOO_MUCH_SERVERS);

        if(!serverEditSchema.check(req.body)){
            return res.error("invalid data");
        }
        let serverInfo = serverEditSchema.parse(req.body);
        const id = f.genID();
        let server: Server = {
            id: id,
            name: serverInfo.name,
            ownerId: req.user.id,
            flags: [],
            banList: [],
            roles: [
                {
                    id: id,
                    name: "everyone",
                    position: 0,
                    color: "#FCFCFC",
                    members: [req.user.id],
                    timestamp: new Date().getTime(),
                    perms: defaultPerms(),
                }
            ],
            channels: [{
                id: id,
                name: "general",
                createdAt: new Date(),
                type: 1
            }],
            iconURL: serverInfo.iconURL ? serverInfo.iconURL : process.env.cdnURL + "/def_server.png",
            createdAt: new Date(),

        };
        if(serverInfo.banner){
            server.banner=serverInfo.banner;
        }
        if(req.user.flags.includes('DEVELOPER')&&serverInfo.flags){
            server.flags=serverInfo.flags;
        }
        if(serverInfo.info){
            server.info=serverInfo.info;
        }
        let date = new Date();
        const message: Message = {
            serverId: server.id,
            type: "NORMAL",
            id: f.genID(),
            createdAt: date,
            timestamp: date.getTime(),
            content: `Welcome **${req.user.username}#${req.user.tag}**!
This is your own Litty server named **${server.name}**.
Invite your friends and start this party right now!`,
            authorId: req.user.id,
            channelId: server.channels[0].id
        }

        await db.insertServer(server);
        req.user.servers.push(server.id);
        await db.updateUser(req.user);
        await db.insertMessage(message);
        let s: any = server;
        s.members =[await db.getMember(req.user.id)];
        emit(req.user.id, "serverCreate", s);
        SocketServer.sockets.sockets.forEach((socket : any)=>{
            // @ts-ignore
            if(socket.id===req.user.id){
                socket.join(server.id);
            }
        });
        return res.success(s);
    } catch (err) {
        return res.error(err)
    }

}
