import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import { messages } from "../../models/responseMessages";
import {guildMemberSchema} from "../../models/user";
import {SocketServer} from "../../app";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(user) {
            if(req.params.id == "@me" && req.params.id == req.user.id) {
                user.deleted=true;
                user.username="DELETED_"+user.username;
                user.onlineStatus=1;
                user.status=1;
                user.email="DELETED_"+user.email;
                const model = await f.without(user, "password token email");
                for(let server of user.servers){
                    emit(server, 'serverMemberUpdate', {id: server, member: {...model}});
                }
                await db.updateUser(model);
                return res.success("Account has been deleted");
            }
            return res.error(messages.UNAUTHORIZED);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
