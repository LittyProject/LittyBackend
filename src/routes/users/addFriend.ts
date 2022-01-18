import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import {exportUserSchema} from "../../models/user";
import {emit} from "../../functions";
import {messages} from "../../models/responseMessages";
import {exportMemberSchema} from "../../models/member";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id);
        if(!user) return res.notFound();
        if(user.id===req.user.id) return res.forbidden();
        if(user.bot) return res.forbidden();
        if(user.friends.includes(req.user.id)) return res.error(messages.USER_IS_FRIEND);
        if(user.friendRequests.includes(req.user.id)) return res.error(messages.ALREADY_SENT_INVITE);
        user.friendRequests.push(req.user.id);
        req.user.sentFriendRequests.push(user.id);
        await db.updateUser({id: user.id, friendRequests: user.friendRequests});
        await db.updateUser({id: req.user.id, sentFriendRequests: req.user.sentFriendRequests});
        emit(user.id, 'userFriendRequest', exportUserSchema.parse(req.user));
        emit(req.user.id, 'userFriendPending', exportUserSchema.parse(user));
        const b = await f.getOnlyByZod(user, exportMemberSchema);
        return res.success(b);
    } catch(err) {
        return res.error(err);
    }
}
