import db from '../db';
import express from 'express';

export default function(perm: string){
    return async function(req: express.Request, res: express.Response, next: express.NextFunction){
        if(!req.user){
            return res.notAuthorized();
        }
        if(!req.user.flags.includes(perm)){
            return res.forbidden();
        }
        next();
    }
}

