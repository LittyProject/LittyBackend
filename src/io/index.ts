import {Message} from "../models/messages";
import db from "../db";
import * as f from "../functions";
import {messages} from "../models/responseMessages";
import socket from "socket.io";
import {guildMemberSchema, updateCustomStatus} from "../models/user";
import {presenceSchema} from "../models/application";
import {emit} from "../functions";



module.exports = async (io: socket.Socket)=>{
    io.on("connection", async (socket: any)=>{
       socket.on("authentication", async (data:any) =>{
           if(!data.token||!data.type){
               socket.emit("authentication_error", {type: "data", message: "Invalid Data"});
               socket.disconnect(true);
               return;
           }
           const token = data.token;
           const type = data.type;
           if(type==="BEARER"){
               const user = await db.getUserByToken(token);
               if(!user) {
                   socket.emit("authentication_error", {type: "data", message: "Invalid Token"});
                   socket.disconnect(true);
                   return;
               }
               if(user.banned){
                   socket.emit("authentication_error", {type: "user", message: "User is banned"});
                   socket.disconnect(true);
                   return;
               }
               socket.auth=true;
               socket.token=token;
               socket.type=type;
               socket.id=user.id;
               await socket.join(`${user.id}`);
               let servers = await db.getUserServersWithMembers(user.id);
               let userData = await f.without(user, "password token lastIP servers");
               const applications = await db.getUserApplications(user.id);
               let friends: any[] = [];
               let friendRequests: any[] = [];
               let sendFriendRequests: any[] = [];
               await Promise.all(userData.friends.map(async (a : string)=>{
                   let model = await f.getOnlyByZod(await db.getUser(a), guildMemberSchema);
                   friends.push(model)
               }));
               await Promise.all(userData.friendRequests.map(async (a : string)=>{
                   let model = await f.getOnlyByZod(await db.getUser(a), guildMemberSchema);
                   friendRequests.push(model)
               }));
               await Promise.all(userData.sendFriendRequests.map(async (a : string)=>{
                   let model = await f.getOnlyByZod(await db.getUser(a), guildMemberSchema);
                   sendFriendRequests.push(model)
               }));
               // @ts-ignore
               socket.emit("authenticated", true);
               socket.emit("setUser", userData);
               socket.emit("setFriends", {friends: friends, friendRequests: friendRequests,sendFriendRequests: sendFriendRequests});
               socket.emit("setServers", servers);
               socket.emit("setApplications", applications);
               try {
                   let validatedStatus = updateCustomStatus.parse({status: user.onlineStatus});
                   user.status = <number>validatedStatus.status;
                   // @ts-ignore
                   servers.map(async (a) => {
                       socket.join(`${a.id}`);
                       emit(a.id, 'memberUpdateStatus', {id: user.id, server: a.id, ...validatedStatus});
                   });
                   await emit(user.id, 'userUpdate', {...validatedStatus});
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
               if(!presenceSchema.check(data.data)){
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
        setTimeout(function() {
            if (!socket.auth) {
                socket.emit("authentication_error", {type: "data", message: "Invalid authorization"});
                socket.disconnect(true);
            }
        }, 10000);
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
                    let validatedStatus = updateCustomStatus.parse({status: 1});
                    user.status = <number>validatedStatus.status;
                    for(let server of user.servers){
                        emit(server, 'memberUpdateStatus', {id: user.id, server: server, ...validatedStatus});
                    }
                    await emit(user.id, 'userUpdate', {...validatedStatus});
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
            if(!socket.auth||socket.type !=="BEARER") return;
            if(data.server){
                let user = await db.getUserByToken(socket.token);
                if(!user?.servers.includes(data.server)) return;
                socket.join(data.server);
            }
        });
        socket.on("serverMessageTypingStart", async(data:any)=>{
            if(!socket.auth||socket.type !=="BEARER") return;
            emit(data.server,"serverMessageTypingStart", data);
        });
        socket.on("serverMessageTypingStop", async(data:any)=>{
            if(!socket.auth||socket.type !=="BEARER") return;
            emit(data.server,"serverMessageTypingStop", data);
        });
        socket.on("leave", async(data: any)=>{
            if(!socket.auth||socket.type !=="BEARER") return;
            if(data.server){
                let user = await db.getUserByToken(socket.token);
                if(!user?.servers.includes(data.server)) return;
                socket.leave(data.server);
            }
        });
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
                    await emit(server, 'memberUpdateStatus', {id: user.id, server: server, ...validatedStatus});
                })
                await emit(user.id, 'userUpdate', {...validatedStatus});
                await db.updateUser(user);
            } catch(err) {
                console.log(err);
            }
        });
    });
};
