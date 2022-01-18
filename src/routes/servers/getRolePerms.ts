import express from 'express';
import db from "../../db";
import {Role} from '../../models/role'
import {Server} from "../../models/server";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.params.role) return res.notFound();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();

        const server : Server | null = await db.getServer(req.params.id);
        if(server) {
            let role : Role | null  = await db.getRole(req.params.role);
            if(!role){
                return res.notFound();
            }
            return res.success(role.perms);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
