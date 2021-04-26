import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import {Member, guildMemberSchema} from "../../models/user";

export default async function(req: express.Request, res: express.Response) {
    try {

        if(!req.user) return res.notAuthorized();

        let server: any = await db.getExploreServers();
        await Promise.all(server.map(async(a: any)=>{
            let b = await db.getServerOnlines(a.id);
            a.online=b.online;
            a.offline=b.offline;
        }));
        if(server) {
            return res.success(server);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
