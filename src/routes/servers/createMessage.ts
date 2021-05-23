import express from 'express';
import db from "../../db";
import {Message, messageSchema} from "../../models/messages";
import {messages} from "../../models/responseMessages";
import * as f from "../../functions";
import {SocketServer} from "../../app";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.params.channel) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();


        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            server.roles = server.roles.sort(function(a: any, b: any){return b.position - a.position});
            // @ts-ignore
            let userRole = server.roles.find((a: any)=> a.members.includes(req.user.id));
            if(!userRole){
                return res.error("Error with member roles");
            }
            // @ts-ignore
            if(!userRole.perms.find((a: any)=> a.name==="SEND_MESSAGE").type&&server.ownerId !==req.user.id){
                return res.error("you are not has permission to that");
            }
            let channel = server.channels.find(a=>a.id === req.params.channel);
            console.log(channel);
            if(!channel){
                return res.notFound();
            }
            let date = new Date();
            const msg: Message = {
                type: req.body.type,
                id: f.genID(),
                timestamp: date.getTime(),
                content: req.body.content,
                authorId: req.user.id,
                channelId: channel.id,
                serverId: server.id,
                createdAt: date
            };
            if(messageSchema.check(msg)){
                let response;
                switch (req.body.type){
                    case "NORMAL":
                        response = await db.insertMessage(msg);
                        emit(server.id, 'serverMessageCreate', msg);
                        emit(server.id, 'serverMessageTypingStop', {server: server.id, channel: channel.id, typer: req.user.id});
                        return res.success(response);
                    default:
                        return res.error(messages.INVALID_DATA);
                }
            }else{
                return res.error(messages.INVALID_DATA);
            }
        }
    } catch(err) {
        return res.error(err);
    }
}
