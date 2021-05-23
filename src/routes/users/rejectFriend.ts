import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import {guildMemberSchema} from "../../models/user";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let user = await db.getUser(req.params.id);
        if(!user) return res.notFound();
        if(user.id===req.user.id) return res.forbridden();
        if(user.bot) return res.forbridden();
        if(user.friends.includes(req.user.id)) return res.error("This user is your friend");
        if(!req.user.sendFriendRequests.includes(user.id)) return res.error("You are not send invite");
        req.user?.friendRequests.splice(req.user?.friendRequests.findIndex(a=> a===user?.id), 1);
        user?.sendFriendRequests.splice(user?.sendFriendRequests.findIndex(a=> a===req.user?.id), 1);
        await db.updateUser(req.user);
        await db.updateUser(user);
        emit(user.id, 'userFriendReject', await f.getOnlyByZod(req.user, guildMemberSchema));
        emit(req.user.id, 'userFriendReject', await f.getOnlyByZod(user, guildMemberSchema));
        return res.success();
    } catch(err) {
        return res.error(err);
    }
}
