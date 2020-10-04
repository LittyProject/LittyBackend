import {Message} from "../models/messages";
import db from "../db";
import * as f from "../functions";
import {messages} from "../models/responseMessages";

async function saveMessage(io: any, data: any): Promise<any>{
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


module.exports = async (io: any)=>{

    require('socketio-auth')(io, {
        authenticate: async function (socket: any, data: any, callback: any) {
            const token = data.token;
            const user = await db.getUserByToken(token);
            if(!user) return callback(new Error(messages.UNAUTHORIZED));
            if(user.banned) return callback(new Error(messages.BANNED));
            return callback(null, true);
        },
        postAuthenticate: async function postAuthenticate(socket: any, data: any) {
            const token = data.token;
            const user = await db.getUserByToken(token);
            socket.user = user;
        },
        disconnect: function disconnect(socket: any) {
            console.log(socket.id + ' disconnected');
        },
        timeout: 5000
    });

    io.on("connection", async (socket: any)=>{

        socket.on("connect-servers", async (data: any, callback: any)=>{
            try {
                const user = await db.getUser(socket.user.id);
                if(!user) throw messages.UNAUTHORIZED;
                if(user.banned) throw messages.BANNED;
                if(user.servers == []) return callback();
                for(let server of user.servers){
                    socket.join(server);
                }
                callback();
            } catch(err) {
                callback(new Error(err));
            }
        });

        socket.on("createMessage", async (data: any, callback: any)=>{
            const user = await db.getUser(socket.user.id);
            if(!user) throw messages.UNAUTHORIZED;
            if(user.banned) throw messages.BANNED;
            saveMessage(io, data);
            callback();
        });

        socket.on("createChannel", async (data: any, callback: any)=>{
            const user = await db.getUser(socket.user.id);
            if(!user) throw messages.UNAUTHORIZED;
            if(user.banned) throw messages.BANNED;
            io.to(data.serverID).emit(`newChannel`, data.channel);
            callback();
        });

        socket.on("memberJoinServer", async (data: any, callback: any)=>{
            const user = await db.getUser(socket.user.id);
            if(!user) throw messages.UNAUTHORIZED;
            if(user.banned) throw messages.BANNED;
            io.to(data.serverID).emit("newMember", data.channel);
            callback();
        });
    });
};
