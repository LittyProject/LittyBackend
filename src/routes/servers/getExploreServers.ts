import express from 'express';
import db from "../../db";
import * as f from "../../functions";
import {exportMemberSchema, Member, memberSchema} from "../../models/member";
import {Server} from "../../models/server";
import { exportMinimalUserSchema, exportUserSchema } from '../../models/user';

export default async function(req: express.Request, res: express.Response) {
    try {

        if(!req.user) return res.notAuthorized();

        let server: Partial<any>[] = await db.getExploreServers();
        await Promise.all(server.map(async(a: any)=>{
            a.owner = await exportMinimalUserSchema.parse(a.owner);
            let b = await db.getServerOnlines(a.id);
            a.online=b.online;
            a.offline=b.offline;
        }));
        return res.success(server);
    } catch(err) {
        return res.error(err);
    }
}
