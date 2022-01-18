import express from 'express';
import {userUpdate, User, exportUserSchema} from "../../models/user";
import db from "../../db";
import * as f from "../../functions";
import { messages } from '../../models/responseMessages';
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import { Server } from '../../models/server';

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(user) {
            const cd = await userUpdate.safeParseAsync(req.body);
            if(!cd.success){
                return res.error(messages.INVALID_DATA);
            }
            let model = await userUpdate.parseAsync(req.body);
            await db.updateUser({id: user.id, ...model});
            const userServers : Server[] | [] =  await db.getUserServers(user.id);
            for(let server of userServers){
                emit(server.id, 'serverMemberUpdate', {serverId: server.id, memberId: `${user.id}`, data: {...model}})
            }
            for(let friendId of req.user.friends){
                emit(friendId, 'friendUpdate', {id: req.user.id, data: {...model}});
            }
            emit(user.id, 'userUpdate', {...model});
            return res.success({...model});
        }
        return res.notFound();
    } catch(err) {
        console.log(err);
        return res.error(err);
    }
}
