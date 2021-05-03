import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import {guildMemberSchema} from "../../models/user";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id);
        if(!user)res.notFound();
        if(user?.id===req.user.id) res.forbridden();
        if(user?.bot)res.forbridden();
        if(user?.friends.includes(req.user.id)) res.error("This user is your friend");
        // @ts-ignore
        if(!req.user.sendFriendRequests.includes(user?.id)) res.error("You are not send invite");
        user.friendRequests.splice(user.friendRequests.findIndex(a=> a===req.user.id), 1);
        req.user.sendFriendRequests.splice(req.user.sendFriendRequests.findIndex(a=> a===user.id), 1);
        await db.updateUser({id: user.id, friendRequests: user.friendRequests, friends: user.friends});
        await db.updateUser({id: req.user.id, sendFriendRequests: req.user.sendFriendRequests, friends: req.user.friends});
        emit(user.id, 'userFriendReject', await f.getOnlyByZod(req.user, guildMemberSchema));
        emit(req.user.id, 'userFriendReject', await f.getOnlyByZod(user, guildMemberSchema));
    } catch(err) {
        return res.error(err);
    }
}