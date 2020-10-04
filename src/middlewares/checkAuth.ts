import db from '../db';
import express from 'express';
import { userSchema } from '../models/user';

export default async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    let token = req.headers['authorization'];
    if(!token) {
	    return res.notAuthorized();
    }
    
    token = token.split(' ')[1];

    const user = await db.getUserByToken(token);
    if(!user) {
	    return res.notAuthorized();
	} else {
        if(user.banned) return res.banned();
        req.user = user;
        next();
    }

    /*if(!hasPerm(user.perm, perm)) {
        res.error('unauthorized');
        return;
    }*/

    
}