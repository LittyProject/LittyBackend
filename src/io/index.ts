import {Message} from "../models/messages";
import db from "../db";
import * as f from "../functions";
import {messages} from "../models/responseMessages";
import socket from "socket.io";
import {deviceSchema, exportUserSchema, updateCustomStatus, userUpdate} from "../models/user";
import {presenceSchema} from "../models/application";
import {emit} from "../functions";
import {instrument} from "@socket.io/admin-ui";
import { FirebaseAdmin } from "../app";
import { Server } from "../models/server";

module.exports = async (io: socket.Socket)=>{
    io.on("connection", async (socket: any)=>{
        console.log(socket);
       socket.on("authentication", async (data:any) =>{
           if(!data.token||!data.type){
               socket.emit("authentication_error", {type: "data", message: "Invalid Data"});
               socket.disconnect(true);
               return;
           }
<<<<<<< HEAD
           console.log(data);
=======

>>>>>>> 5b96a94eba98e7653a5707bc86e35b0503969d19
           const token = data.token;
           const cst = data.data;
           const type = data.type;
           if(type==='BOT'){
                const user = await db.getUserByToken(token);
                if(!user) {
                    socket.emit("authentication_error", {type: "data", message: "Invalid Token"});
                    socket.disconnect(true);
                    return;
                }
                if(!user.bot){
                    socket.emit("authentication_error", {type: "user", message: "This authorization for bots"});
                    socket.disconnect(true);
                    return;
                }
                socket.auth=true;
                socket.token=token;
                socket.type=type;
                socket.id=user.id;
                socket.join(`${user.id}`);
                let modeledUser = await exportUserSchema.parseAsync(user);
                socket.emit("setUser", modeledUser);
                socket.emit("authenticated", true);

           }
           if(type==="BEARER"){
               const user = await db.getUserByToken(token);
               if(!user) {
                   socket.emit("authentication_error", {type: "data", message: "Invalid Token"});
                   socket.disconnect(true);
                   return;
               }
               if(user.bot){
                   socket.emit("authentication_error", {type: "user", message: "This authorization for users"});
                   socket.disconnect(true);
                   return;
               }
               if(user.banned){
                   socket.emit("authentication_error", {type: "user", message: "User is banned"});
                   socket.disconnect(true);
                   return;
               }
               if(!cst.platform&&!cst.name&&!cst.version){
                   socket.emit("authentication_error", {type: "user", message: "Device information not send (platform, name, version)"});
                   socket.disconnect(true);
                   return;
               }
               if(cst.push){
                   socket.push = cst.push;

               }
               //Kekw
               socket.auth=true;
               socket.token=token;
               socket.type=type;
               socket.id=user.id;
               socket.join(`${user.id}`);
               let dd = await db.getUserServers(user.id);
               let servers = await db.getUserServersData(user.id);
               let userData = await f.without(user, "password token lastIP");
               const applications = await db.getUserApplications(user.id);
               let friends: any[] = [];
               let users: any[] = [];
               let friendRequests: any[] = [];
               let sentFriendRequests: any[] = [];
               await Promise.all(userData.friends.map(async (a : string)=>{
                   let model = exportUserSchema.parse(await db.getUser(a));
                   friends.push(model)
               }));
               await Promise.all(userData.friendRequests.map(async (a : string)=>{
                   let model = exportUserSchema.parse(await db.getUser(a));
                   friendRequests.push(model)
               }));
               await Promise.all(userData.sentFriendRequests.map(async (a : string)=>{
                   let model = exportUserSchema.parse(await db.getUser(a));
                   sentFriendRequests.push(model)
               }));
               await Promise.all(servers.map(async (a : any)=>{
                   await Promise.all(a.members.map(async(b : any)=>{
                       const c = await db.getUser(b.memberId);
                       let model = exportUserSchema.parse(c);
                       users.push(model)
                   }))
               }));
               // @ts-ignore
               socket.emit("authenticated", true);
               socket.emit("setUser", userData);
               if(user.flags.includes('DEVELOPER')){
                   const a = await db.getStaffMessageFrom(user.id);
                   socket.emit('setSentStaffMessage', {sentStaffMessage: a});
               }
               if(user.flags.includes('STAFF')){
                   const a = await db.getStaffMessageTo(user.id);
                   socket.emit('setStaffMessage', {staffMessage: a});
               }
               socket.emit("setUsers", users);
               socket.emit("setFriends", {friends: friends});
               socket.emit("setFriendsRequest", {friendsRequests: friendRequests});
               socket.emit("setSentFriendsRequest", {sentFriendRequests: sentFriendRequests});
               socket.emit("setServers", servers);
               socket.emit("setApplications", applications);

               try {
                   let validatedStatus = updateCustomStatus.parse({status: user.onlineStatus});
                   user.status = <number>validatedStatus.status;
                   let dataSchema : any = {id: socket.client.id, name: cst.name, version: cst.version, platform: cst.platform};
                    if(cst.push){
                        dataSchema['data'] = {push: cst.push};
                    }
                    if(user.devices){
                        if(user.devices.length > 0) user.devices?.push(deviceSchema.parse(dataSchema));
                        if(user.devices.length === 0) user.devices = [deviceSchema.parse(dataSchema)];
                    }
                   // @ts-ignore
                   servers.map(async (a) => {
                       socket.join(`${a.id}`);
                       emit(`${a.id}`, 'serverMemberUpdate', {memberId: user.id, serverId: a.id, data: {...validatedStatus}});
                   });
                   await emit(user.id, 'userUpdate', {...validatedStatus});
                   for(let friendId of user.friends){
                    emit(friendId, 'friendUpdate', {id: user.id, data: {...validatedStatus}});
                    }
                   await db.updateUser(user);
               } catch(err) {
                   console.log(err);
               }

           }else if(type==="APPLICATION"){
               if(!data.data){
                   socket.emit("authentication_error", {type: "data", message: "Invalid Presence Data"});
                   socket.disconnect(true);
                   return;
               }
               const app = await db.getApplication(data.token);
               if(!app){
                   socket.emit("authentication_error", {type: "data", message: "Application not found"});
                   socket.disconnect(true);
                   return;
               }
               if(!presenceSchema.safeParse(data.data).success){
                   socket.emit("authentication_error", {type: "data", message: "Invalid Presence Data"});
                   socket.disconnect(true);
                   return;
               }
               socket.auth=true;
               socket.token=token;
               socket.type=type;
               try{
                   io.to(app.owner).emit("userPresenceUpdate", {appName: app.name, owner: app.owner, ...data.data});
               }catch (err){
                   console.log(err);
               }
               socket.emit("authenticated", f.without(app, "token bot"));
           }else{
               socket.emit("authentication_error", {type: "data", message: "Invalid Token Type"});
               socket.disconnect(true);
               return;
           }
       });
        // setTimeout(function() {
        //     if (!socket.auth) {
        //         socket.emit("authentication_error", {type: "data", message: "Invalid authorization"});
        //         socket.disconnect(true);
        //     }
        // }, 10000);
        socket.on("applicationPresenceUpdate", async(data: any)=>{
            if(!socket.auth && socket.type !=="APPLICATION") return;
            const app = await db.getApplication(socket.token);
            if(!app){
                socket.emit("applicationPresenceUpdate", {type: "data", message: "Application not found"});
                socket.disconnect(true);
                return;
            }
            try{
                io.to(app.owner).emit("userPresenceUpdate", {appName: app.name, owner: app.owner, ...data.data});
            }catch (err){
                console.log(err);
            }
        })
        socket.on('disconnect', async(d: any)=>{
            if(!socket.auth) return;
            if(socket.type==="BEARER"){
                try {
                    let user = await db.getUserByToken(socket.token);
                    if(!user) throw messages.UNAUTHORIZED;
                    if(user.banned) throw messages.BANNED;
                    user.onlineStatus = user.status;
                    if(user.devices && user.devices.length>0){
                        if(user.devices.length===1){
                            let validatedStatus = updateCustomStatus.parse({status: 1});
                            user.status = <number>validatedStatus.status;
                            const userServers = await db.getUserServers(user.id);
                            for(let server of userServers){
                                emit(server.id, 'serverMemberUpdate', {memberId: user.id, serverId: server.id, data: {...validatedStatus}});
                            }
                            for(let friendId of user.friends){
                                emit(friendId, 'friendUpdate', {id: user.id, data: {...validatedStatus}});
                            }
                            await emit(user.id, 'userUpdate', {...validatedStatus});
                        }
                        user.devices = user.devices.slice(0, user.devices.findIndex(a=> a.id === socket.client.id));
                    }else{
                        let validatedStatus = updateCustomStatus.parse({status: 1});
                        user.status = <number>validatedStatus.status;
                        const userServers = await db.getUserServers(user.id);
                        for(let server of userServers){
                            emit(server.id, 'serverMemberUpdate', {memberId: user.id, serverId: server.id, data: {...validatedStatus}});
                        }
                        for(let friendId of user.friends){
                            emit(friendId, 'friendUpdate', {id: user.id, data: {...validatedStatus}});
                        }
                        await emit(user.id, 'userUpdate', {...validatedStatus});
                    }
                    await db.updateUser(user);
                    // @ts-ignore
                } catch(err) {
                    console.log(err);
                }
            }else if(socket.type==="APPLICATION"){
                const app = await db.getApplication(socket.token);
                if(!app)  return;
                try{
                    io.to(app.owner).emit("userPresenceUpdate", null);
                }catch (err){
                    console.log(err);
                }
            }
        });
        socket.on("join", async(data: any)=>{
            console.log("socket.on join")
            console.log(data)
            if(!socket.auth||socket.type !=="BEARER") return;
            if(data.server){
                let user = await db.getUserByToken(socket.token);
                if(!user) return;
                if(!(await db.isUserInServer(user.id, data.server))) return;
                socket.join(data.server);
            }
        });
        socket.on('sendUpdateUser', async(data:any)=>{
            console.log(data);
            if(!socket.auth&&socket.type !=='BOT') return;
            let model = await userUpdate.parseAsync(data);
            await db.updateUser({id: socket.id, ...model});
            const userServers : Server[] | [] =  await db.getUserServers(socket.id);
            for(let server of userServers){
                emit(server.id, 'serverMemberUpdate', {serverId: server.id, memberId: `${socket.id}`, data: {...model}})
            }
            emit(socket.id, 'userUpdate', {...model});
        });
        socket.on("serverMessageTypingStart", async(data:any) => {
            console.log("serverMessageTypingStart");
            console.log(data);
            if(!socket.auth||socket.type !=="BEARER") return;
            emit(data.serverId,"serverMessageTypingStart", data);
        });
        socket.on("serverMessageTypingStop", async(data:any) => {
            console.log("serverMessageTypingStop");
            console.log(data);
            if(!socket.auth||socket.type !=="BEARER") return;
            emit(data.serverId,"serverMessageTypingStop", data);
        });
        socket.on("leave", async(data: any)=>{
            if(!socket.auth||socket.type !=="BEARER") return;
            if(data.server){
                let user = await db.getUserByToken(socket.token);
                if(!user) return socket.leave(data.server);
                if(!(await db.isUserInServer(user.id, data.server))) return;
                socket.leave(data.server);
            }
        });
<<<<<<< HEAD
        socket.on("userUpdateStatus", async (data: any)=>{
            if(!socket.auth||socket.type !=="BEARER") return;
            try {
                let user = await db.getUserByToken(socket.token);
                if(!user) throw messages.UNAUTHORIZED;
                if(user.banned) throw messages.BANNED;
                let validatedStatus = updateCustomStatus.parse(data);
                if(validatedStatus.customStatus){
                    user.customStatus = validatedStatus.customStatus;
                }
                if(validatedStatus.status){
                    user.status = validatedStatus.status;
                }
                user.servers.map(async(server)=>{
                    await emit(server, 'memberUpdateStatus', {id: user?.id, server: server, ...validatedStatus});
                })
                await emit(user.id, 'userUpdate', {...validatedStatus});
                await db.updateUser(user);
            } catch(err) {
                console.log(err);
            }
        });
=======

>>>>>>> 5b96a94eba98e7653a5707bc86e35b0503969d19
    });
};
