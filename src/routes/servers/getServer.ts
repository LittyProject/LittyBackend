import express from 'express';
import db from "../../db";
import {Member, guildMemberSchema} from "../../models/user";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();

        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            server.members =await db.getUsersOnServer(server.id);
            return res.success(server);
        }
    } catch(err) {
        return res.error(err);
    }
}
