import express from 'express';
import db from "../../db";
import {Message, messageSchema} from "../../models/messages";
import {messages} from "../../models/responseMessages";
import * as f from "../../functions";
import {SocketServer} from "../../app";

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
            let channel = server.channels.find(a=>a.id === req.params.channel);
            console.log(channel);
            if(!channel){
                return res.notFound();
            }
            if(req.query.after&&req.query.limit){
                let d : number = parseInt(<string>req.query.limit);
                if(d>0&&d<=50){
                    const b = await db.getMessagesAfterLimit(server.id, channel.id, parseInt(<string>req.query.after), parseInt(<string>req.query.limit));
                    res.success(b)
                }else{
                    return res.error("Invalid messages limit");
                }
            }else if(req.query.before&&req.query.limit){
                let d : number = parseInt(<string>req.query.limit);
                if(d>0&&d<=50){
                    const b = await db.getMessagesBeforeLimit(server.id, channel.id, parseInt(<string>req.query.before), parseInt(<string>req.query.limit));
                    res.success(b)
                }else{
                    return res.error("Invalid messages limit");
                }
            }else if(req.query.from&&req.query.to){
                const b = await db.getMessagesSince(server.id, channel.id, parseInt(<string>req.query.from), parseInt(<string>req.query.to));
                res.success(b)
            }else{
                return res.error("Query is not set | available: after, before | required limit [1-50]")
            }
        }
    } catch(err) {
        return res.error(err);
    }
}
