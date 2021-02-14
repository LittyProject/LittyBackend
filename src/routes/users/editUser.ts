import express from 'express';
import { userUpdate, User } from "../../models/user";
import db from "../../db";
import * as f from "../../functions";
import { messages } from '../../models/responseMessages';
import {SocketServer} from "../../app";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(user) {
            if(userUpdate.check(req.body)){
                let model = userUpdate.parse(req.body);
                if(user.username != model.username&&user.tag != model.tag){
                    console.log("elo");
                    let s = await db.getUserByUsernameAndTag(model.username, model.tag);
                    if(s)return res.error({reason: messages.INVALID_DATA, data: "Found user with this same username and tag"});
                }
                user = Object.assign(user, model);
                await db.updateUser(user);
                for(let server of user.servers){
                    SocketServer.to(server).emit('memberUpdate', {id: user.id, server: server, data: {...model}});
                }
                SocketServer.to(user.id).emit('userUpdate', model);
                return res.success(user);
            }
            return res.error(messages.INVALID_DATA);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
