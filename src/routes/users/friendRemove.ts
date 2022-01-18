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
        if(!user.friends.includes(req.user.id)) return res.error(messages.USER_IS_NOT_FRIEND);
        user.friends.splice(user.friends.findIndex(a=> a === req.user?.id), 1);
        req.user.friends.splice(req.user.friends.findIndex(a=> a === user?.id), 1);
        await db.updateUser({id: user.id, friendRequests: user.friendRequests, friends: user.friends});
        await db.updateUser({id: req.user.id, sentFriendRequests: req.user.sentFriendRequests, friends: req.user.friends});
        emit(user.id, 'userFriendRemove', req.user?.id);
        emit(req.user.id, 'userFriendRemove', user?.id);
        return res.success();
    } catch(err) {
        return res.error(err);
    }
}
