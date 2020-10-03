import { r, Connection } from 'rethinkdb-ts';

import {Server} from '../models/server';
import {User} from '../models/user';
import {Channel} from '../models/channels';
import {Message} from '../models/messages';

let _conn: Connection | null = null;
async function conn(): Promise<Connection> {
    if (_conn == null) {
        _conn = await r.connect({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            db: process.env.DB_DATABASE
        });
    }
    return _conn;
}

const servers = r.table('servers');
const users = r.table('users');
const messages = r.table('messages');
const userAlive = r.table('checkUsers');

class DB {
    async getUser(id: string): Promise<User | null> {
        const u = await users.get(id).run(await conn());
        if(u){
            let isAlive = await this.isUserAlive(id);
            if(!isAlive) {
                u.status = "offline";
                return u;
            }
        }
        return u || null;
    }

    async getUserByToken(token: string): Promise<User | null> {
        const arr = await users.filter({token}).run(await conn());
        if(arr.length > 0){
            let isAlive = await this.isUserAlive(arr[0].id);
            if(!isAlive) {
                arr[0].status = "offline";
                return arr[0] as User;
            }
        }
        return arr.length > 0 ? arr[0] as User : null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const arr = await users.filter({email}).run(await conn());
        if(arr.length > 0){
            let isAlive = await this.isUserAlive(arr[0].id);
            if(!isAlive) {
                arr[0].status = "offline";
                return arr[0] as User;
            }
        }
        return arr.length > 0 ? arr[0] as User : null;
    }

    async getUserByUsernameAndTag(username: string, tag: string): Promise<User | null> {
        const arr = await users.filter({username, tag}).run(await conn());
        if(arr.length > 0){
            let isAlive = await this.isUserAlive(arr[0].id);
            if(!isAlive) {
                arr[0].status = "offline";
                return arr[0] as User;
            }
        }
        return arr.length > 0 ? arr[0] as User : null;
    }

    async getUserCount(): Promise<number> {
        return await users.count().run(await conn());
    }
    
    async insertUser(user: User): Promise<User> {
        await users.insert(user).run(await conn());
        await this.userAlive(user.id);
        return user;
    }

    async updateUser(user: User | {id: string}): Promise<void> {
        await users.get(user.id).update(user).run(await conn());
    }

    async getUserServers(userID: string): Promise<Server[] | null> {
        let user = await this.getUser(userID);
        if(!user) return [];
        let toReturn: Server[] = [];
        for(let x of user.servers) {
            let server = await this.getServer(x);
            if(!server) continue;
            await toReturn.push(server);
        };
        return toReturn;
    }



    
    async insertServer(server: Server): Promise<Server> {
        await servers.insert(server).run(await conn());
        return server;
    }

    async getUsersOnServer(serverID: string): Promise<User[] | null> {
        let userArray: User[] = await users.filter(r.row("servers").contains(serverID)).run(await conn());
        if(userArray.length < 1) return [];
        let toReturn: User[] = [];
        for(let x of userArray) {
            let user = await this.getUser(x.id);
            if(!user) continue;
            await toReturn.push(user);
        };
        return toReturn;
    }
    
    async getServer(serverID: string): Promise<Server | null> {
        return await servers.get(serverID).run(await conn());
    }

    async getAllServers(): Promise<Server[]> {
        return await servers.run(await conn());
    }

    async updateServer(server: Server | {id: string}): Promise<void> {
        await servers.get(server.id).update(server).run(await conn());
    }



    async insertMessage(message: Message): Promise<Message> {
        await messages.insert(message).run(await conn());
        return message;
    }

    async getMessageCount(): Promise<number> {
        return await messages.count().run(await conn());
    }
    
    async getMessage(messageID: string): Promise<Message | null> {
        return await messages.get(messageID).run(await conn());
    }

    async getAllMessages(): Promise<Message[]> {
        return await messages.run(await conn());
    }

    async updateMessage(message: Message | {id: string}): Promise<void> {
        await messages.get(message.id).update(message).run(await conn());
    }





    async isUserAlive(id: string): Promise<boolean> {
        const u = await users.get(id).run(await conn());
        if(u){
            const cu = await userAlive.get(id).run(await conn());
            if(!cu){
                await userAlive.insert({id, lastChecked: Date.now()}).run(await conn());
                return true;
            } else {
                if((cu.lastChecked + 1000 * 60 * 2) > Date.now()){
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    async userAlive(id: string): Promise<boolean> {
        const u = await users.get(id).run(await conn());
        if(u){
            const cu = await userAlive.get(id).run(await conn());
            if(!cu){
                await userAlive.insert({id, lastChecked: Date.now()}).run(await conn());
            } else {
                if((cu.lastChecked + 1000 * 60 * 2) > Date.now()){
                    // just do nothing
                } else {
                    await userAlive.get(id).update({lastChecked: Date.now()}).run(await conn());
                }
            }
            return true;
        } else {
            return false;
        }
    }
}

export default new DB();
