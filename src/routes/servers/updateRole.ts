import express from 'express';
import db from "../../db";
import {updateRole} from "../../models/payload";
import {defaultPerms} from "../../models/server";
import {SocketServer} from "../../app";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        console.log(req.user);
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.params.role) return res.notFound();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();

        let server = await db.getServerWithMembers(req.params.id);
        if(server) {
            server.roles = server.roles.sort(function(a: any, b: any){return b.position - a.position});
            // @ts-ignore
            let userRole = server.roles.find((a: any)=> a.members.includes(req.user.id));
            console.log(userRole);
            if(!userRole.perms.find((a: any)=> a.name==="MANAGE_ROLES").type&&server.ownerId !==req.user.id){
                return res.error("you are not has permission to that");
            }
            let role = server.roles.find((a : any)=>a.id === req.params.role);
            if(!role){
                return res.notFound();
            }
            if(role.id===server.id){
                console.log("there")
                return res.forbridden();
            }
            if(!updateRole.check(req.body)){
                console.log(updateRole.parse(req.body));
                return res.error("invalid data");
            }
            let roleUpdate = updateRole.parse(req.body);
            if(roleUpdate.name)role.name=roleUpdate.name;
            if(roleUpdate.color)role.color=roleUpdate.color;
            if(roleUpdate.position)role.position=roleUpdate.position;
            if(roleUpdate.perms){
                await roleUpdate.perms.map((b: any)=>{
                    if(role.perms.find((a: any)=> a.name===b.name)){
                        role.perms.find((a: any)=> a.name===b.name).type=b.type;
                    }
                });
            }
            if(roleUpdate.member){
                if(server.members.find((a: any)=> a.id===roleUpdate.member)){
                    if(role.members.includes(roleUpdate.member)){
                        role.members.splice(role.members.findIndex((a: any)=> a===roleUpdate.member), 1);
                    }else{
                        role.members.push(roleUpdate.member);
                    }
                }else{
                    return res.error("invalid member");
                }
            }
            await db.updateServer({id: server.id, roles: [...server.roles]});
            emit(server.id, 'serverRoleUpdate', {id: server.id, data: role});
            return res.success(role);
        }
        return res.notFound();
    } catch(err) {
        console.log(err);
        console.log("there")
        return res.error(err);
    }
}
