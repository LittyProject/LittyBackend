
import express from 'express';
import { updateFlags } from "../../models/server";
import db from "../../db";
import {SocketServer} from "../../app";
import {emit} from "../../functions";
import {Channel} from "../../models/channel";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();
        let server = await db.getServer(req.params.id);
        if(!server){
            return res.notFound();
        }else{
            let channels : Channel[] | [] = await db.getServerChannels(req.params.id, false);
            emit(server.id, 'setServerChannels', {id: server.id, data: channels});
            return res.success('Channels has been sorted');
        }
    } catch(err) {
        return res.error(err);
    }
}
