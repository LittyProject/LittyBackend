import db from '../db';
import express from 'express';
import { userSchema } from '../models/user';

export default function(perm: number){
    return async function(req: express.Request, res: express.Response, next: express.NextFunction){
        if(!req.user){
            return res.notAuthorized();
        }
        if(req.user.perm<perm){
            return res.forbridden();
        }
        next();
    }
}

