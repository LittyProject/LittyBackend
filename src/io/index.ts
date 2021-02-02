import {Message} from "../models/messages";
import db from "../db";
import * as f from "../functions";
import {messages} from "../models/responseMessages";
import socket from "socket.io";
import {updateCustomStatus} from "../models/user";

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

    require('socketio-auth')(io, {
        authenticate: async function (socket: any, data: any, callback: any) {
            const token = data.token;
            const user = await db.getUserByToken(token);
            if(!user) return callback(new Error(messages.UNAUTHORIZED));
            if(user.banned) return callback(new Error(messages.BANNED));
            socket.join(user.id);
            for(let server of user.servers){
                socket.join(server);
            }
            return callback(null, true);
        },
        postAuthenticate: async function postAuthenticate(socket: any, data: any) {
            socket.token = data.token;
        },
        disconnect: function disconnect(socket: any) {
            console.log(socket.id + ' disconnected');
        },
        timeout: 5000
    });

    io.on("connection", async (socket: any)=>{
        console.log(socket.id + ' connected');

        socket.on("updateCustomStatus", async (data: any)=>{
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
                await db.updateUser(user);
                for(let server of user.servers){
                    socket.to(server).emit(validatedStatus);
                }
                socket.to(user.id).emit(validatedStatus);
            } catch(err) {
                console.log(err);
            }
        });

        socket.on("createMessage", async (data: any)=>{
            const user = await db.getUserByToken(socket.token);
            if(!user) throw messages.UNAUTHORIZED;
            if(user.banned) throw messages.BANNED;
            await saveMessage(io, data);
        });

        socket.on("createChannel", async (data: any)=>{
            const user = await db.getUserByToken(socket.token);
            if(!user) throw messages.UNAUTHORIZED;
            if(user.banned) throw messages.BANNED;
            io.to(data.serverID).emit(`newChannel`, data.channel);
        });

        socket.on("memberJoinServer", async (data: any)=>{
            const user = await db.getUserByToken(socket.token);
            if(!user) throw messages.UNAUTHORIZED;
            if(user.banned) throw messages.BANNED;
            io.to(data.serverID).emit("newMember", data.channel);
        });
    });
};
