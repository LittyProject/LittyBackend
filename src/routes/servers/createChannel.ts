import express from 'express';
import db from "../../db";
import {Channel, channelEditSchema, channelSchema} from "../../models/server";
import * as f from '../../functions';
import {SocketServer} from "../../app";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
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
            if(server.channels.length===50){
                return res.error("Server can only have 50 channels");
            }
            if(!channelEditSchema.check(req.body)){
                return res.error("Invalid data");
            }
            let channelSchema = channelEditSchema.parse(req.body);
            const channel : Channel = {
                id: f.genID(),
                name: channelSchema.name,
                createdAt: new Date(),
                type: channelSchema.type
            }
            server.channels.push(channel);
            await db.updateServer(server);
            emit(server.id, 'serverChannelCreate', {id: server.id, data: channel});
            return res.success(channel);
        }
    } catch(err) {
        return res.error(err);
    }
}