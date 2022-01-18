import express from 'express';
import db from "../../db";
import {Server} from "../../models/server";
import {Role} from "../../models/role";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();
        const server : Server | null = await db.getServer(req.params.id);
        if(server) {
            let role : Role[] | null  = await db.getServerRoles(server.id, false);
            return res.success(role);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
