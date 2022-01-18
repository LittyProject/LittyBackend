import bcrypt from 'bcrypt';
import {exportUserSchema} from "./models/user";
import {ZodObject} from "zod";
import {FirebaseAdmin, SocketServer} from "./app";
const uniqid = require('uniqid');

export function genID(): string{
    return uniqid();
}

export async function compareHash(string: string, password: string): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
        bcrypt.compare(string, password, async function(err, result) {
            if(err) rej(err);
            else res(result);
        });
    });
}


export async function sendPushToUser(userId: string, title: string, subtitle: string, channel: string){
    var payload = {
        notification: {
          title: title,
          body: subtitle
        },
        data: {
            channel: channel
        }
      };
      
       var options = {
        priority: "high",
      };
       FirebaseAdmin.messaging().sendToDevice("/topics/"+userId, payload, options)
   .then(function(response : any) {
     console.log("Successfully sent message:", response);
   })
   .catch(function(error : any) {
     console.log("Error sending message:", error);
   });
}

export async function sendPushToTopic(topic: string, title: string, subtitle: string, channel: string){
    var payload = {
        notification: {
          title: title,
          body: subtitle
        },
        data: {
            channel: "default_litty_channel"
        }
      };
      
       var options = {
        priority: "high",
      };
       FirebaseAdmin.messaging().sendToDevice("/topics/"+topic, payload, options)
   .then(function(response : any) {
     console.log("Successfully sent message:", response);
   })
   .catch(function(error : any) {
     console.log("Error sending message:", error);
   });
}

export function emit(room: string, event: string, data: any){
    SocketServer.sockets.sockets.forEach((socket : any)=>{
        if(socket.rooms.has(room)){
            socket.emit(event, data);
        }
    });
}

export function emitAll(event: string, data: any){
    SocketServer.sockets.sockets.forEach((socket : any)=>{
        if(socket.auth&&socket.type==='BEARER'){
            socket.emit(event, data);
        }
    });
}

export function formatSize(x: number){
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    let l = 0, n = parseInt(String(x), 10) || 0;

    while(n >= 1024 && ++l){
        n = n/1024;
    }
    return {size: Number(n.toFixed(n < 10 && l > 0 ? 1 : 0)), type: units[l]};
}

export async function hashPassword(string: string): Promise<string> {
    return new Promise<string>((res, rej) => {
        bcrypt.genSalt(10, async function(err, salt) {
            await bcrypt.hash(string, salt, async function (err, hash) {
                if (err) rej(err);
                else res(hash);
            });
        });
    })
}

export function createID(length: number) {
    let result  = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function createTag() {
    let result  = '';
    let characters = '0123456789ABCDEF';
    let charactersLength = characters.length;
    for (let i = 0; i < 4; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// await f.getOnly(user, "id avatarURL bot");
export async function getOnly(model: any, whatToGet: string){
    if(whatToGet == "" || model == {}) return {};
    let keys = await whatToGet.split(" ");
    let toReturn: any = {};
    for(let num in keys){
        toReturn[keys[num]] = model[keys[num]];
    }
    return toReturn;
}


export async function getOnlyByZod(model: any, whatToGet: any){
    if(!whatToGet || model == {}) return {};
    let keys = [];
    for(let key in whatToGet.toJSON){
        for(let key2 in whatToGet.toJSON[key]){
            keys.push(key2.toString());
        }
    }
    let toReturn: any = {};
    for(let num in keys){
        toReturn[keys[num]] = model[keys[num]];
    }
    return toReturn;
}



export async function without(model: any, without: string){
    if(without == "" || model == {}) return {};
    let keys = await without.split(" ");
    let toReturn: any = {};
    for(let num in keys){
        if(model[keys[num]]){
            delete model[keys[num]];
        }
    }
    return model;
}

