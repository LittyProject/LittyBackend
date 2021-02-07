import express from 'express';
import db from "../../db";
import {Member, guildMemberSchema} from "../../models/user";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();

        let server: any = await db.getServer(req.params.id);
        if(server) {
            server.members =await db.getUsersOnServer(server.id);
            return res.success(server);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
