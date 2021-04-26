import express from 'express';
import db from "../../db";
import {Role, roleEditSchema} from "../../models/server";
import * as f from '../../functions';
import {SocketServer} from "../../app";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) {
            console.log('brak usera')
            return res.notAuthorized();
        }
        if(!req.user.servers.includes(req.params.id)){
            console.log(req.user.servers);
            console.log('nie jestes na serwerze')
            return res.notFound()
        }
        let server = await db.getServer(req.params.id);
        if(!server) {
            console.log('brak serwera')
            return res.notFound();
        } else {
            if(server.roles.length===20){
                return res.error("Server can only have 20 roles");
            }
            let b = req.body;
            b.position = parseInt(b.position);
            if(!roleEditSchema.check(b)){
                return res.error("Invalid data");
            }
            let roleSchema = roleEditSchema.parse(b);
            const role : Role = {
                id: f.genID(),
                name: roleSchema.name,
                timestamp: new Date().getTime(),
                position: roleSchema.position,
                color: roleSchema.color,
                members: [],
            }
            server.roles.push(role);
            await db.updateServer(server);
            SocketServer.to(server.id).emit('serverRoleCreate', {id: server.id, data: role});
            return res.success(role);
        }
    } catch(err) {
        return res.error(err);
    }
}