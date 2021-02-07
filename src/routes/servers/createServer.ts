import {Server, serverEditSchema} from "../../models/server";
import express from 'express';
import * as f from '../../functions';
import db from "../../db";
import { Message } from "../../models/messages";
import { messages } from "../../models/responseMessages";
import { SocketServer } from "../../app";
import socket from "socket.io";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized();
        if(req.user.servers.length >= 50) return res.error(messages.TOO_MUCH_SERVERS);

        let serverInfo = serverEditSchema.parse(req.body);

        const server: Server = {
            id: f.genID(),
            name: serverInfo.name,
            ownerId: req.user.id,
            banList: [],
            channels: [{
                id: f.genID(),
                name: "general",
                createdAt: new Date()
            }],
            iconURL: process.env.cdnURL + "/def_server.png",
            createdAt: new Date(),

        };

        const message: Message = {
            id: f.genID(),
            createdAt: new Date(),
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
        res.success(server);

        await SocketServer.in(req.user.id).emit("createServer", server);
        return;
    } catch (err) {
        return res.error(err)
    }

}
