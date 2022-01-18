import express from 'express';
import db from "../../db";
import {Message, messageSchema} from "../../models/messages";
import {messages} from "../../models/responseMessages";
import * as f from "../../functions";
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import {Channel} from "../../models/channel";
import {Permission} from "../../models/permission";
import { AnyRecord } from 'dns';


export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.params.channel) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();


        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            let roles = await db.getServerRoles(server.id);
            let member = await db.getMember(req.user.id, server.id);
            if(!member) return res.notFound();
            let userRole = await db.getMemberRoles(req.user.id, req.params.id);
            // @ts-ignore
            if(!userRole[0].perms.find(a=> a.name === 'ADMINISTRATOR').type){
                // @ts-ignore
                if(!userRole[0].perms.find(a=> ['SEND_MESSAGE', 'MANAGE_SERVER'].includes(a.name)).type){
                    return res.error(messages.FORBIDDEN);
                }
            }
            const channel: Channel | null = await db.getChannel(req.params.channel);
            if (!channel || channel.serverId !== server.id) {
                return res.notFound();
            }
            let date = new Date();
            const msg: Message = {
                deleted: false,
                embeds: [],
                polls: [],
                type: req.body.type,
                id: f.genID(),
                timestamp: date.getTime(),
                content: req.body.content,
                authorId: req.user.id,
                channelId: channel.id,
                serverId: server.id,
                createdAt: date
            };
            if (messageSchema.safeParse(msg).success) {
                const response = await db.insertMessage(msg);
                let args: any[] = msg.content.split(" ");
                let ids = await db.getMembersId(server.id);
                if(ids){
                    ids = ids.map((a:any)=> {
                        return {value: a, mention: `<@${a}>`};
                    })
                    if(args.includes(`<@${server.id}>`)){
                        ids?.filter(a=> a !==req.user.id).forEach((a: any)=> {
                            f.sendPushToUser(`${a}`, `✉️ ${server ? server.name : 'Not name'} (${channel.name})`, `${req.user.username}#${req.user.tag} : ${msg.content}`, 'server_mention');
                        });
                    }
                    args.forEach((c:any) => {
                        console.log(c);
                        let mention = ids?.find(b=> b.mention===c);
                        if(mention&&mention.value !== req.user.id){
                            console.log(mention);
                            f.sendPushToUser(`${mention.value}`, `✉️ ${server ? server.name : 'Not name'} (${channel.name})`, `${req.user.username}#${req.user.tag} : ${msg.content}`, 'server_mention');
                        }
                    });
                }
                
                emit(server.id, 'serverMessageCreate', msg);
                emit(server.id, 'serverMessageTypingStop', {
                    serverId: server.id,
                    channelId: channel.id,
                    memberId: req.user.id
                });
                console.log("success");
                return res.success(response);
            } else {
                return res.error(messages.INVALID_DATA);
            }
        }
    } catch(err) {
        return res.error(err);
    }
}
