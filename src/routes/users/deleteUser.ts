import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import { messages } from "../../models/responseMessages";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(!user) return res.notFound();
        if(req.params.id == "@me" && req.params.id == req.user.id) {
            user.deleted=true;
            user.username="DELETED_"+user.username;
            user.onlineStatus=1;
            user.status=1;
            user.email="DELETED_"+user.email;
            const model = await f.without(user, "password token email");
            const userServers = await db.getUserServers(user.id);
            for(let server of userServers){
                emit(server.id, 'serverMemberUpdate', {id: server.id, member: {...model}});
            }
            emit(user.id, 'userUpdate', {...model});
            await db.updateUser(model);
            return res.success(messages.ACCOUNT_DELETED_SUCCESS);
        }
        return res.error(messages.UNAUTHORIZED);
    } catch(err) {
        return res.error(err);
    }
}
