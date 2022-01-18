import express from 'express';
import { updateFlags } from "../../models/user";
import db from "../../db";
import {SocketServer} from "../../app";
import {manageUser} from "../../models/payload";
import {messages} from "../../models/responseMessages";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {

        if (!req.user) return res.notAuthorized;
        let user = await db.getUser(req.params.id);
        if (user) {
            console.log(req.body);
            let model = manageUser.parse(req.body);
            if (!manageUser.safeParse(req.body).success) {
                return res.error(messages.INVALID_DATA);
            }
            //let model = manageUser.parse(req.body);

            await db.updateUser({id: user.id, ...model});
            emit(user.id, 'userUpdate', {...model});
            const userServers = await db.getUserServers(user.id);
            for(let server of userServers){
                emit(server.id, 'serverMemberUpdate', {member: user.id, server: server.id, data: {...model}})
            }
            return res.success(model);
        }
        return res.notFound();
    } catch (e) {
        console.log(e);
        return res.notFound();
    }
}
