import express from 'express';
import { updateFlags } from "../../models/user";
import db from "../../db";
import {SocketServer} from "../../app";
import {manageUser} from "../../models/payload";
import {messages} from "../../models/responseMessages";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    if(!req.user) return res.notAuthorized;
    let user = await db.getUser(req.params.id);
    if(user) {
        if (!manageUser.check(req.body)) {
            return res.error(messages.INVALID_DATA);
        }
        let model = manageUser.parse(req.body);

        await db.updateUser({id: user.id, ...model});
        emit(user.id, 'userUpdate', {data: {...model}})
        for (let server of user.servers) {
            emit(server, 'serverMemberUpdate', {id: user.id, server: server, data: {...model}})
            return res.success(model);
        }
    }
    return res.notFound();
}