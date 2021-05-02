import express from 'express';
import db from "../../db";
import {updateChannel} from "../../models/payload"
import {SocketServer} from "../../app";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.params.channel) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();
        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            server.roles = server.roles.sort(function(a: any, b: any){return b.position - a.position});
            // @ts-ignore
            let userRole = server.roles.find((a: any)=> a.members.includes(req.user.id));
            if(!userRole){
                return res.error("Error with member roles");
            }
            // @ts-ignore
            if(!userRole.perms.find((a: any)=> a.name==="MANAGE_CHANNELS").type&&server.ownerId !==req.user.id){
                return res.error("you are not has permission to that");
            }
            let channel = server.channels.find(a=>a.id === req.params.channel);
            if(!channel){
                return res.notFound();
            }
            if(!updateChannel.check(req.body)){
                return res.error("invalid data");
            }
            channel.name = req.body.name;
            await db.updateServer({id: server.id, channels: [...server.channels]});
            emit(server.id, 'serverChannelUpdate', {id: server.id, data: channel});
            return res.success(channel);
        }
    } catch(err) {
        return res.error(err);
    }
}
