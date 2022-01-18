import express from 'express';
import db from "../../db";
import {Role} from "../../models/role";
import {messages} from "../../models/responseMessages";
import {Server} from "../../models/server";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.params.role) return res.notFound();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.error(messages.NOT_IN_SERVER);

        let server : Server | null = await db.getServer(req.params.id);
        if(server) {
            const role : Role | null = await db.getRole(req.params.role);
            if(!role){
                return res.notFound();
            }
            return res.success(role);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
