import express from 'express';
import db from "../../db";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if (user) {
            if (!user.friendRequests) return res.notFound();
            res.success(user.sentFriendRequests);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
