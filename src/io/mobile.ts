import {Message} from "../models/messages";
import db from "../db";
import * as f from "../functions";
import {messages} from "../models/responseMessages";
import socket from "socket.io";
import {exportUserSchema, updateCustomStatus} from "../models/user";
import {presenceSchema} from "../models/application";
import {emit} from "../functions";
import {instrument} from "@socket.io/admin-ui";

module.exports = async (io: socket.Socket)=>{
    io.on("connection", async (socket: any)=>{
        console.log('Mobile device trying connect');
        socket.auth=false;
        socket.on("authentication", async (data:any) => {
            if(!data.token||!data.fetch){
                socket.emit("authentication_error", {type: "data", message: "Invalid Data"});
                socket.disconnect(true);
                return;
            }
            const token = data.token;
            const fetch = data.fetch;
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
            socket.id=user.id;
            socket.join(`${data.id}`);
            socket.emit('debugAdd', {description: 'Mobile gateway first connection', type: 'INFO', timestamp: new Date()});
            if(fetch.includes('user')){
                socket.emit("setUser", user);
                socket.emit('debugAdd', {type: 'INFO', description: `Event: setUser (Socket id: ${socket.id})\n${JSON.stringify(user)}`, timestamp: new Date()});
            }
            if(fetch.includes('application')){
                const applications = await db.getUserApplications(user.id);
                socket.emit("setApplications", applications);
                socket.emit('debugAdd', {type: 'INFO', description: `Event: setApplications (Socket id: ${socket.id})\n${JSON.stringify(applications)}`, timestamp: new Date()});
            }
            if(fetch.includes('friends')){
                let friends: any[] = [];
               let users: any[] = [];
               let friendRequests: any[] = [];
               let sentFriendRequests: any[] = [];
               await Promise.all(user.friends.map(async (a : string)=>{
                   let model = exportUserSchema.parse(await db.getUser(a));
                   friends.push(model)
               }));
               await Promise.all(user.friendRequests.map(async (a : string)=>{
                   let model = exportUserSchema.parse(await db.getUser(a));
                   friendRequests.push(model)
               }));
               await Promise.all(user.sentFriendRequests.map(async (a : string)=>{
                   let model = exportUserSchema.parse(await db.getUser(a));
                   sentFriendRequests.push(model)
               }));
               socket.emit("setFriends", {friends: friends, friendRequests: friendRequests, sentFriendRequests: sentFriendRequests});
            }
        });
    
    });
}