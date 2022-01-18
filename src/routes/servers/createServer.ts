import {ExportServer, Server, serverEditSchema} from "../../models/server";
import express from 'express';
import * as f from '../../functions';
import db from "../../db";
import { Message } from "../../models/messages";
import { messages } from "../../models/responseMessages";
import { SocketServer } from "../../app";
import {emit} from "../../functions";
import {Role} from "../../models/role";
import {Channel, ExportChannel} from "../../models/channel";
import {defaultPerms} from "../../models/permission";
import {Member} from "../../models/member";
const config = require("../../../config.json");

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized();
        if((await db.getUserServersCount(req.user.id)) >= 50) return res.error(messages.TOO_MUCH_SERVERS);

        if(!serverEditSchema.safeParse(req.body).success){
            return res.error(messages.INVALID_DATA);
        }
        let serverInfo = serverEditSchema.parse(req.body);
        const id = f.genID();
        let server: Server = {
            banner: serverInfo.iconURL ? serverInfo.iconURL : `${process.env.cdnURL}/${config.cdn.server.banner.path}/default.png`,
            deleted: false,
            info: {
                tags: [],
                description: ""
            },
            id: id,
            name: serverInfo.name,
            ownerId: req.user.id,
            flags: [],
            banList: [],
            iconURL: serverInfo.iconURL ? serverInfo.iconURL : `${process.env.cdnURL}/${config.cdn.server.icon.path}/default.png`,
            createdAt: new Date()
        };

        let member: Member = {
            id: `${server.id}-${req.user.id}`,
            joinedAt: new Date(),
            memberId: req.user.id,
            nickname: null,
            roles: [id],
            serverId: server.id
        }

        let role: Role = {
            createdAt: new Date(),
            deleted: false,
            serverId: server.id,
            id: id,
            name: "everyone",
            position: 1,
            color: "#FCFCFC",
            timestamp: new Date().getTime(),
            perms: defaultPerms(),
        };

        let channel: Channel = {
            label: [],
            typing: [],
            deleted: false,
            position: 1,
            serverId: server.id,
            id: f.genID(),
            name: "general",
            createdAt: new Date(),
            type: 1
        };


        if(serverInfo.banner){
            server.banner = serverInfo.banner;
        }
        if(req.user.flags.includes('DEVELOPER') && serverInfo.flags){
            server.flags = serverInfo.flags;
        }
        if(serverInfo.info){
            server.info = serverInfo.info;
        }
        let date = new Date();
        const message: Message = {
            deleted: false,
            embeds: [],
            polls: [],
            serverId: server.id,
            type: "NORMAL",
            id: f.genID(),
            createdAt: date,
            timestamp: date.getTime(),
            content: `Welcome **${req.user.username}#${req.user.tag}**!
This is your own Litty server named **${server.name}**.
Invite your friends and start this party right now!`,
            authorId: req.user.id,
            channelId: channel.id
        }

        await db.insertServer(server);
        await db.insertChannel(channel);
        await db.insertRole(role);
        await db.insertMember(member);
        await db.insertMessage(message);
        let exportServer: ExportServer = server;
        exportServer.members = await db.getServerMembers(server.id);
        exportServer.channels = await db.getServerChannels(server.id);
        exportServer.roles = await db.getServerRoles(server.id);

        for (let ch of exportServer.channels) {
            ch.messages = await db.getMessages(server.id, ch.id, Date.now());
        }


        emit(req.user.id, "serverCreate", exportServer);
        SocketServer.sockets.sockets.forEach((socket : any)=>{
            // @ts-ignore
            if(socket.id === req.user.id){
                socket.join(server.id);
            }
        });
        return res.success(exportServer);
    } catch (err) {
	console.log(err);
        return res.error(err);
    }

}
