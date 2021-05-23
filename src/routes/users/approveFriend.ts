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
        if(!req.user?.friendRequests.includes(user?.id)) return res.error("You are not send invite");
        req.user?.friends.push(user?.id);
        req.user?.friendRequests.splice(req.user?.friendRequests.findIndex(a=> a===user?.id), 1);

        user?.friends.push(req.user?.id);
        user?.sendFriendRequests.splice(user?.sendFriendRequests.findIndex(a=> a===req.user?.id), 1);

        await db.updateUser(user);
        await db.updateUser(req.user);
        emit(user.id, 'userFriendApprove', await f.getOnlyByZod(req.user, guildMemberSchema));
        emit(req.user.id, 'userFriendApprove', await f.getOnlyByZod(user, guildMemberSchema));
        return res.success();
    } catch(err) {
        return res.error(err);
    }
}
