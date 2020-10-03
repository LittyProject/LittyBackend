import { Server } from "../../models/server";
import express from 'express';
import * as f from '../../functions';
import db from "../../db";
import { Message } from "../../models/messages";

export default async function(req: express.Request, res: express.Response) {
    if(!req.user) return res.notAuthorized();
    if(req.user.servers.length >= 50) return res.error("too much servers on");

    const server: Server = {
        id: f.genID(),
        name: req.body.name,
        ownerId: req.user.id,
        banList: [],
        channels: [{
            id: f.genID(),
            name: "general",
            createdAt: new Date()
        }],
        iconURL: process.env.cdnURL + "/def_server.png",
        createdAt: new Date()
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

    return res.success(server);
}