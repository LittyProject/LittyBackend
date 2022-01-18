import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import {exportUserSchema} from "../../models/user";
import {emit} from "../../functions";
import {messages} from "../../models/responseMessages";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let user = await db.getUser(req.params.id);
        if(!user) return res.notFound();
        if(user.id===req.user.id) return res.forbidden();
        if(user.bot) return res.forbidden();
        if(user.friends.includes(req.user.id)) return res.error(messages.USER_IS_FRIEND);
        if(!req.user.sentFriendRequests.includes(user.id)) return res.error(messages.NOT_FOUND);
        req.user?.friendRequests.splice(req.user?.friendRequests.findIndex(a=> a===user?.id), 1);
        user?.sentFriendRequests.splice(user?.sentFriendRequests.findIndex(a=> a===req.user?.id), 1);
        await db.updateUser(req.user);
        await db.updateUser(user);
        emit(user.id, 'userFriendReject', exportUserSchema.parse(req.user));
        emit(req.user.id, 'userFriendReject', exportUserSchema.parse(user));
        return res.success();
    } catch(err) {
        return res.error(err);
    }
}
