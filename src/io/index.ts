import {Message} from "../models/messages";
import db from "../db";
import * as f from "../functions";
import {messages} from "../models/responseMessages";
import socket from "socket.io";
import {updateCustomStatus} from "../models/user";
import {presenceSchema} from "../models/application";

async function saveMessage(io: socket.Socket, data: any): Promise<any>{
    try {
        let user = await db.getUser(data.user.id);
        if(!user) return;
        const msg: Message = {
            id: f.genID(),
            content: data.message,
            authorId: user.id,
            channelId: data.channelID,
            createdAt: new Date()
        };
        let toSend: any = msg;
        toSend.author = await db.getUser(msg.authorId);
        let mess = await db.insertMessage(msg);
        io.to(data.serverID).emit(`newMessage`, msg);
    } catch(err) {
        return console.log(err);
    }
}


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
               try {
                   let validatedStatus = updateCustomStatus.parse({status: user.onlineStatus});
                   user.status = <number>validatedStatus.status;
                   for(let server of user.servers){
                       io.to(server).emit('updateCustomStatus', {id: user.id, server: server, ...validatedStatus});
                   }
                   io.to(user.id).emit('updateCustomStatus', {...validatedStatus});
                   await db.updateUser(user);
               } catch(err) {
                   console.log(err);
               }
               socket.emit("authenticated", true);
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
               socket.emit("authenticated", true);
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
                        io.to(server).emit('updateCustomStatus', {id: user.id, server: server, ...validatedStatus});
                    }
                    io.to(user.id).emit('updateCustomStatus', {...validatedStatus});
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
        socket.on("updateCustomStatus", async (data: any)=>{
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
                    io.to(server).emit('updateCustomStatus', {id: user.id, server: server, ...validatedStatus});
                }
                io.to(user.id).emit('updateCustomStatus', {...validatedStatus});
                await db.updateUser(user);
            } catch(err) {
                console.log(err);
            }
        });

        socket.on("createMessage", async (data: any)=>{
            if(!socket.auth||socket.type !=="BEARER") return;
            const user = await db.getUserByToken(socket.token);
            if(!user) throw messages.UNAUTHORIZED;
            if(user.banned) throw messages.BANNED;
            await saveMessage(io, data);
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
