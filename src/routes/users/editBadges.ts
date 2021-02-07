import express from 'express';
import { updateBadges } from "../../models/user";
import db from "../../db";
import {SocketServer} from "../../app";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let user = await db.getUser(req.params.id);
        if(user) {
            let model = updateBadges.parse(req.body);
            user = Object.assign(user, model);
            await db.updateUser(user);
            for(let server of user.servers){
                SocketServer.to(server).emit('badgeUpdate', {id: user.id, server: server, data: {...model}});
            }
            SocketServer.to(user.id).emit('badgeUpdate', model);
            return res.success(model);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
