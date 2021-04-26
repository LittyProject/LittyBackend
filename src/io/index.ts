import {Message} from "../models/messages";
import db from "../db";
import * as f from "../functions";
import {messages} from "../models/responseMessages";
import socket from "socket.io";
import {guildMemberSchema, updateCustomStatus} from "../models/user";
import {presenceSchema} from "../models/application";



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
               socket.join(user.id);
               for(let server of user.servers){
                   socket.join(server);
               }
               let servers = await db.getUserServersWithMembers(user.id);
               let userData = await f.without(user, "password token lastIP servers");
               let friends = [];
               for(let friend of userData.friends){
                   let model = await f.getOnlyByZod(await db.getUser(friend), guildMemberSchema);
                   friends.push(model)
               }
               socket.emit("authenticated", true);
               socket.emit("setUser", userData);
               socket.emit("setFriends", friends);
               socket.emit("setServers", servers);
               try {
                   let validatedStatus = updateCustomStatus.parse({status: user.onlineStatus});
                   user.status = <number>validatedStatus.status;
                   // @ts-ignore
                   for(let server of servers){
                       io.to(server.id).emit('memberUpdateStatus', {id: user.id, server: server.id, ...validatedStatus});
                   }
                   io.to(user.id).emit('userUpdateStatus', {...validatedStatus});
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
                        io.to(server).emit('memberUpdateStatus', {id: user.id, server: server, ...validatedStatus});
                    }
                    io.to(user.id).emit('userUpdateStatus', {...validatedStatus});
                    await db.updateUser(user);
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
                for(let server of user.servers){
                    io.to(server).emit('memberUpdateStatus', {id: user.id, server: server, ...validatedStatus});
                }
                io.to(user.id).emit('userUpdateStatus', {...validatedStatus});
                await db.updateUser(user);
            } catch(err) {
                console.log(err);
            }
        });


        socket.on("createChannel", async (data: any)=>{
            if(!socket.auth||socket.type !=="BEARER") return;
            const user = await db.getUserByToken(socket.token);
            if(!user) throw messages.UNAUTHORIZED;
            if(user.banned) throw messages.BANNED;
            io.to(data.serverID).emit(`newChannel`, data.channel);
        });

        socket.on("memberJoinServer", async (data: any)=>{
            if(!socket.auth||socket.type !=="BEARER") return;
            const user = await db.getUserByToken(socket.token);
            if(!user) throw messages.UNAUTHORIZED;
            if(user.banned) throw messages.BANNED;
            io.to(data.serverID).emit("newMember", data.channel);
        });

    });
};
