import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import {guildMemberSchema} from "../../models/user";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id);
        if(!user) return res.notFound();
        if(user.id===req.user.id) return res.forbridden();
        if(user.bot) return res.forbridden();
        if(user.friends.includes(req.user.id)) return res.error("This user is your friend");
        if(user.friendRequests.includes(req.user.id)) return res.error("You are send invite");
        user.friendRequests.push(req.user.id);
        req.user.sendFriendRequests.push(user.id);
        await db.updateUser({id: user.id, friendRequests: user.friendRequests});
        await db.updateUser({id: req.user.id, sendFriendRequests: req.user.sendFriendRequests});
        emit(user.id, 'userFriendRequest', await f.getOnlyByZod(req.user, guildMemberSchema));
        emit(req.user.id, 'userFriendPending', await f.getOnlyByZod(user, guildMemberSchema));
        const b = await f.getOnlyByZod(user, guildMemberSchema);
        return res.success(b);
    } catch(err) {
        return res.error(err);
    }
}
