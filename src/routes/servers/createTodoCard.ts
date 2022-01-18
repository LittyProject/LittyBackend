import express from 'express';
import db from "../../db";
import {Channel} from "../../models/channel";
import {Todo, todoSchema, todoCard} from '../../models/entity/todo';
import {messages} from "../../models/responseMessages";
import {emit} from "../../functions";
import * as f from "../../functions";
import {Permission} from "../../models/permission";
import {Entity} from "../../models/entity/entity";
export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.params.channel) return res.notFound();
        if(!req.params.list) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();


        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            let roles = await db.getServerRoles(server.id);
            let member = await db.getMember(req.user.id, server.id);
            if(!member) return res.notFound();
            let userRole = await db.getMemberRoles(req.user.id, req.params.id);
            // @ts-ignore
            if(!userRole[0].perms.find(a=> a.name === 'ADMINISTRATOR').type){
                // @ts-ignore
                if(!userRole[0].perms.find(a=> ['CREATE_TODO_CARD', 'MANAGE_TODO'].includes(a.name)).type){
                    return res.error(messages.FORBIDDEN);
                }
            }
            const channel: Channel | null = await db.getChannel(req.params.channel);
            if (!channel || channel.serverId !== server.id) {
                return res.notFound();
            }
            if(channel.type !=4){
                return res.error(messages.ENTITY_INVALID_CHANNEL);
            }
            let todoList = await db.getEntity(req.params.list);
            if(!todoList || todoList.serverId !== server.id){
                return res.notFound();
            }
            req.body.type="OPEN";
            req.body.createdBy=req.user.id;
            req.body.timestamp=Date.now();
            console.log(todoCard.safeParse(req.body));
            if(!todoCard.safeParse(req.body).success){
                return res.error(messages.INVALID_DATA);
            }
            const todoData = todoCard.parse(req.body);
            todoList.children.push(todoData);
            await db.updateEntity(todoList);
            emit(server.id, 'serverChannelEntityUpdate', {todoList});
            return res.success(todoData);

        }
    } catch(err) {
        return res.error(err);
    }
}