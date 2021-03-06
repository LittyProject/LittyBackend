import {r, Connection, WriteResult} from 'rethinkdb-ts';

import {Server} from '../models/server';
import {guildMemberSchema, Member, User} from '../models/user';
import {Message} from '../models/messages';
import {Invite} from "../models/invite";

import * as f from "../functions";
import {Application} from "../models/application";
import {number} from "zod";
import {Changelog} from "../models/changelog";

let _conn: Connection | null = null;
async function conn(): Promise<Connection> {
    if (_conn == null) {
        console.log("Database connected");
        // @ts-ignore
        _conn = await r.connect({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            db: process.env.DB_DATABASE,
            port: process.env.DB_PORT
        });
        console.log(r.tableList());
        console.log("Database connected");
    }
    return _conn;
}

const servers = r.table('servers');
const invite = r.table('invites');
const users = r.table('users');
const messages = r.table('messages');//
const userAlive = r.table('checkUsers');
const applications = r.table('applications');
const changelog = r.table('changelog');

class DB {
    async conn(): Promise<Connection> {
        if (_conn == null) {
            console.log("Database connected");
            // @ts-ignore
            _conn = await r.connect({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                db: process.env.DB_DATABASE,
                port: process.env.DB_PORT
            });
            console.log("Database connected");
        }
        return _conn;
    }

    async getUser(id: string): Promise<User | null> {
        const u = await users.get(id).run(await conn());
        return u || null;
    }

    async getMember(id: string): Promise<Member | null> {
        let u = await users.get(id).run(await conn());
        u = await f.getOnlyByZod(u, guildMemberSchema);
        return u || null;
    }

    async getUserByToken(token: string): Promise<User | null> {
        const arr = await users.filter({token: token}).run(await conn());
        return arr.length > 0 ? arr[0] as User : null;
    }

    async getUserApplications(id: string): Promise<Application[] | null> {
        const arr = await applications.filter({owner: id}).run(await conn());
        return arr.length > 0 ? arr as Application[] : [];
    }

    async deleteApplication(id: string): Promise<void> {
        await applications.get(id).delete().run(await conn());
    }

    async updateApplication(id: string, data: any): Promise<void> {
        await applications.get(id).update(data).run(await conn());
    }

    async getApplication(token: string): Promise<Application | null> {
        const arr = await applications.filter({token: token}).run(await conn());
        return arr.length > 0 ? arr[0] as Application : null;
    }

    async isIPBanned(ip: string): Promise<boolean> {
        const arr = await users.filter({lastIP: ip}).run(await conn());
        return arr.length > 0;
    }

    async getServerInvites(id: string): Promise<Invite[] | null> {
        const a = await invite.filter({guild:{id: id}}).run(await conn());
        if(a.length > 0){
            return a as Invite[];
        }else{
            return null;
        }
    }

    async getInvite(id: string): Promise<Invite | null> {
        const a = await invite.filter({code: id}).run(await conn());
        if(a.length > 0){
            return a[0] as Invite;
        }else{
            return null;
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        const arr = await users.filter({email: email}).run(await conn());
        return arr.length > 0 ? arr[0] as User : null;
    }

    async getUserByUsernameAndTag(username: string, tag: string): Promise<User | null> {
        const arr = await users.filter({username, tag}).run(await conn());
        return arr.length > 0 ? arr[0] as User : null;
    }

    async getUserCount(): Promise<number> {
        return await users.count().run(await conn());
    }

    async insertUser(user: User): Promise<User> {
        await users.insert(user).run(await conn());
        return user;
    }

    async insertChangelog(changelog1: Changelog): Promise<Changelog> {
        await changelog.insert(changelog1).run(await conn());
        return changelog1;
    }

    async getChangelogs(): Promise<any[]> {
        return changelog.orderBy({index: "createdAt"}).run(await conn());
    }

    async insertApplication(app: Application): Promise<Application> {
        await applications.insert(app).run(await conn());
        return app;
    }

    async insertInvite(invitee: Invite): Promise<Invite> {
        await invite.insert(invitee).run(await conn());
        return invitee;
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
        }
        return toReturn;
    }

    async getUserServersWithMembers(userID: string): Promise<Server[] | null> {
        let user = await this.getUser(userID);
        if(!user) return [];
        let toReturn: Server[] = [];
        for(let x of user.servers) {
            let server = await this.getServer(x);
            // @ts-ignore
            server?.members = await this.getUsersOnServer(server.id);
            if(!server) continue;
            await toReturn.push(server);
        }
        return toReturn;
    }

    async getServerWithMembers(s: string): Promise<any | null> {
        let server :any  = await this.getServer(s);
        if(!server) return null;
        server.members = await this.getUsersOnServer(server.id);
        return server;
    }


    async getServerOnlines(id: string): Promise<any | null>{
        let members = await this.getUsersOnServer(id);
        // @ts-ignore
        let online = members.filter(a=>a.status>1).length;
        // @ts-ignore
        let offline = members.filter(a=>a.status<2).length;
        return {online: online, offline: offline};
    }




    async insertServer(server: Server): Promise<Server> {
        await servers.insert(server).run(await conn());
        return server;
    }

    async getUsersOnServer(serverID: string): Promise<Member[] | null> {
        let userArray: Member[] = await users.filter(r.row("servers").contains(serverID)).run(await conn());
        if(userArray.length < 1) return [];
        let toReturn: Member[] = [];
        for(let x of userArray) {
            let user = await this.getMember(x.id);
            if(!user) continue;
            await toReturn.push(user);
        }
        return toReturn;
    }

    async getServerUsers(serverID: string): Promise<User[] | null> {
        return await users.filter(r.row("servers").contains(serverID)).run(await conn());
    }

    async getServer(serverID: string): Promise<Server | null> {
        return await servers.get(serverID).run(await conn());
    }

    async getAllServers(): Promise<Server[]> {
        return await servers.run(await conn());
    }

    async getExploreServers(): Promise<any[]> {
        return await servers.filter(function (d: any) {
            return d('flags').contains('PUBLIC')
        }).without('banList', 'roles', 'channels').run(await conn());
    }

    async updateServer(server: Server | {id: string}): Promise<void> {
        await servers.get(server.id).update(server).run(await conn());
    }



    async deleteServer(id: string) : Promise<void> {
        await servers.get(id).delete().run(await conn());
        const a = await this.getServerUsers(id);
        console.log(id);
        if(a){
            a.map(async (b: User) => {
                b.servers.splice(b.servers.findIndex(a => a === id), 1);
                await this.updateUser({id: b.id, servers: b.servers});
            });
        }
        await invite.filter({serverId: id}).delete().run(await conn());
    }


    async insertMessage(message: Message): Promise<Message> {
        await messages.insert(message).run(await conn());
        return message;
    }

    async getMessageCount(serverID: string, channelID: string): Promise<number> {
        return messages.orderBy({index: "timestamp"}).filter(function (d: any) {
            return d('serverId').eq(serverID)&&d('channelId').eq(channelID)
        }).count().run(await conn());
    }
    async getMessage(messageID: string): Promise<Message | null> {
        return await messages.get(messageID).run(await conn());
    }

    async getAllMessages(): Promise<Message[]> {
        return await messages.run(await conn());
    }

    async getMessages(serverID: string, channelID: string, timestamp: number): Promise<Message[]> {
        let a: Message[] = await messages.orderBy({index: "timestamp"}).between(0, timestamp).filter(function (d: any) {
            return d('serverId').eq(serverID)&&d('channelId').eq(channelID)
        }).limit(20).run(await conn());
        return a;
    }

    async getMessagesFirst(serverID: string, channelID: string): Promise<Message[]> {
        let a: Message[] = await messages.orderBy({index: "timestamp"}).filter(function (d: any) {
            return d('serverId').eq(serverID) && d('channelId').eq(channelID)
        }).run(await conn());
        return a.sort((b, c)=> c.timestamp-b.timestamp).splice(0, 20).reverse();
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
                return (cu.lastChecked + 1000 * 60 * 2) > Date.now();
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
