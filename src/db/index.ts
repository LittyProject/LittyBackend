import {Connection, Primitives, r, RDatum, RValue} from 'rethinkdb-ts';

import {ExportServer, Server} from '../models/server';
import {exportUserSchema, User} from '../models/user';
import {Message} from '../models/messages';
import {Invite} from "../models/invite";
import {ExportMember, exportMemberSchema, Member} from "../models/member";
import {Application} from "../models/application";
import {Changelog} from "../models/changelog";
import {Channel, ExportChannel} from "../models/channel";
import {Role} from "../models/role";
import {Entity} from "../models/entity/entity";
import {StaffMessage} from "../models/staffmessage";
import { AccessCode } from '../models/accessCode';

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
const members = r.table('members');
const roles = r.table('roles');
const channels = r.table('channels');
const invites = r.table('invites');
const users = r.table('users');
const messages = r.table('messages');
const userAlive = r.table('checkUsers');
const applications = r.table('applications');
const changelog = r.table('changelog');
const entities = r.table('entity');
const staffMessage = r.table('staffMessage');
const accessCode = r.table('accessCode');

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

    async getMember(userId: string, serverId: string): Promise<Member | null> {
        return await members.get(`${serverId}-${userId}`).run(await conn());
    }

    async getMemberRoles(userId: string, serverId: string): Promise<Role[] | []> {
        let member : Member | null = await this.getMember(userId, serverId);
        let role : Role[] | [] = [];
        if(!member){
            return role;
        }
        for(let a of member?.roles){
            let b: Role | null = await this.getRole(a);
            // @ts-ignore
            role.push(b);
        }
        return role;
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

    async getServerInvites(serverId: string): Promise<Invite[] | []> {
        const a = await invites.filter({serverId: serverId}).run(await conn());
        if(a.length > 0){
            return a as Invite[];
        }else{
            return [];
        }
    }

    async getServerInvitesCount(serverId: string): Promise<number> {
        return await invites.filter({serverId: serverId}).count().run(await conn());
    }

    async getInvite(id: string): Promise<Invite | null> {
        const a = await invites.filter({code: id}).run(await conn());
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

    async insertStaffMessage(stafmsg: StaffMessage): Promise<StaffMessage> {
        await staffMessage.insert(stafmsg).run(await conn());
        return stafmsg;
    }

    // My recive message
    async getStaffMessageTo(userId: string): Promise<any[]> {
        return staffMessage.orderBy({index: "createdAt"}).filter({to: userId}).run(await conn());
    }

    //My sended message
    async getStaffMessageFrom(userId: string): Promise<any[]> {
        return staffMessage.orderBy({index: "createdAt"}).filter({from: userId}).run(await conn());
    }

    async updateStaffMessage(msg: StaffMessage | {id: string}): Promise<void> {
        await staffMessage.get(msg.id).update(msg).run(await conn());
    }

    async insertChangelog(changelog1: Changelog): Promise<Changelog> {
        await changelog.insert(changelog1).run(await conn());
        return changelog1;
    }


    async getChangelogs(type: string): Promise<any[]> {
        return changelog.orderBy({index: "createdAt"}).filter({type: type}).run(await conn());
    }

    async insertApplication(app: Application): Promise<Application> {
        await applications.insert(app).run(await conn());
        return app;
    }

    async insertInvite(invitee: Invite): Promise<Invite> {
        await invites.insert(invitee).run(await conn());
        return invitee;
    }

    async updateUser(user: User | {id: string}): Promise<void> {
        await users.get(user.id).update(user).run(await conn());
    }

    async getUserServers(userID: string): Promise<Server[] | []> {
        let memb: Member[] = await members.filter({memberId: userID}).run(await conn());
        if(memb.length > 0){
            let toReturn: Server[] = [];
            for(let m of memb) {
                let server: Server | null = await this.getServer(m.serverId);
                if(!server || server.deleted) {
                    await this.deleteMember(m);
                    continue;
                }
                toReturn.push(server);
            }
            return toReturn;
        }
        return [];
    }

    async getSharedServers(firstUserID: string, secondUserID: string): Promise<Server[] | []> {
        let memb1: Member[] = await members.filter({memberId: firstUserID}).run(await conn());
        let memb2: Member[] = await members.filter({memberId: secondUserID}).run(await conn());
        if(memb1.length > 0){
            let toReturn: Server[] = [];
            for(let m of memb1) {
                if(!memb2.find((x: Member) => x.serverId === m.serverId)) continue;
                let server: Server | null = await this.getServer(m.serverId);
                if(!server || server.deleted) {
                    await this.deleteMember(m);
                    continue;
                }
                toReturn.push(server);
            }
            return toReturn;
        }
        return [];
    }

    async getUserServersData(userID: string): Promise<ExportServer[] | []> {
        let s = await this.getUserServers(userID);
        let servers : ExportServer[] | [] = [];
        for(let server of s) {
            let exportServer: ExportServer = server;
            exportServer.members = await this.getServerMembers(server.id, 50);
            exportServer.channels = await this.getServerChannels(server.id, false);
            exportServer.roles = await this.getServerRoles(server.id, false);

            for (let ch of exportServer.channels) {
                ch.messages = await this.getLastMessages(server.id, ch.id);
            }
            // @ts-ignore
            servers.push(exportServer);
        }
        return servers;
    }

    async getExportServer(serverID: string): Promise<ExportServer | null> {
        let exportServer: ExportServer | null = await servers.get(serverID).merge((x : any) => {
            return {
                members: members.filter({serverId: x('id')}).merge((m:any)=> {
                    return {
                        ...users.get(m('memberId')),
                        m
                    }
                }).coerceTo('array'),
                roles: roles.filter({serverId: x('id'), deleted: false}).coerceTo('array'),
                channels: channels.filter({serverId: x('id'), deleted: false}).merge((dx : any) => {
                    return {
                        messages: messages.orderBy({index: r.desc("timestamp")}).filter(function (d: any) {
                            return d('serverId').eq(dx('serverId')) && d('channelId').eq(dx('id'))
                        }).limit(20).coerceTo('array')
                    }
                }).coerceTo('array')
            };
        }).run(await conn());
        if(exportServer&&exportServer.members){
            exportServer.members = await Promise.all(exportServer.members.map(async (a:any) =>{
                return await exportMemberSchema.parse(a);
            }));
        }
        return exportServer;
    }

    async getUserServersCount(userID: string): Promise<number> {
        return await members.filter({memberId: userID}).count().run(await conn());
    }

    async isUserInServer(userID: string, serverID: string): Promise<boolean> {
        let user = await members.filter({memberId: userID, serverId: serverID}).run(await conn());
        return user.length > 0;
    }

    async getServerWithMembers(s: string): Promise<ExportServer | null> {
        let exportServer: ExportServer | null = await servers.get(s).merge((x : any) => {
            return {
                members: members.filter({serverId: x('id')}).coerceTo('array'),
            };
        }).run(await conn());
        return exportServer;
    }

    async getServerOnlines(serverId: string): Promise<{online: number, offline: number}>{
        let members = await this.getServerMembersWithStatuses(serverId);
        // @ts-ignore
        let online = members.filter(a=>a.status>1).length;
        // @ts-ignore
        let offline = members.filter(a=>a.status<2).length;
        return {online: online, offline: offline};
    }

    async getServerChannels(serverId: string, deleted?: boolean): Promise<ExportChannel[] | []>{
        return await channels.orderBy('position').filter({
            serverId: serverId,
            deleted: (typeof deleted == "undefined" ? true : deleted)
        }).run(await conn());
    }


    async getServerRoles(serverId: string, deleted?: boolean): Promise<Role[] | []>{
        return await roles.orderBy('position').filter({
            serverId: serverId,
            deleted: (typeof deleted == "undefined" ? true : deleted)
        }).run(await conn());
    }

    async insertServer(server: Server): Promise<Server> {
        await servers.insert(server).run(await conn());
        return server;
    }

    async getServerMembersWithStatuses(serverID: string): Promise<ExportMember[] | []> {
        let ms: ExportMember[] = await members.filter({serverId: serverID}).merge((x:any)=> {
            return {
                ...users.get(x('memberId')),
                        x
            }
        }).run(await conn());
        ms = await Promise.all(ms.map(async (a:any) =>{
            return await exportMemberSchema.parse(a);
        }));
        return ms;
    }

    async getServerMembersWithoutStatuses(serverID: string): Promise<ExportMember[] | []> {
        let ms: Member[] = await members.filter({serverId: serverID}).run(await conn());
        if(ms.length < 1) return [];
        let toReturn: ExportMember[] = [];
        for(let m of ms) {
            let user = await this.getUser(m.memberId);
            if(!user) continue;
            const member: ExportMember = m;
            member.tag = user.tag;
            member.username = user.username;
            member.bot = user.bot;
            member.avatarURL = user.avatarURL;
            member.createdAt = user.createdAt;
            member.disabled = user.disabled;
            member.banned = user.banned;
            member.deleted = user.deleted;
            member.flags = user.flags;
            await toReturn.push(member);
        }
        return toReturn;
    }

    async getServerMembers(serverId: string, limit?: number, skip?: number): Promise<ExportMember[] | []> {
        const m = await members.filter({serverId: serverId}).skip(skip ?? 0).limit(limit ?? 0).run(await conn());
        const mem: ExportMember[] | [] = [];
        await Promise.all(m.map(async (a : Member)=>{
            let model: ExportMember = await exportMemberSchema.parse(Object.assign(a, await this.getUser(a.memberId)));
            // @ts-ignore
            mem.push(model);
        }));
        // return mem;
        return mem;
        
    }

    async getMembersId(serverId: string): Promise<any[] | null> {
        return await members.filter({serverId: serverId})('memberId').run(await conn());
    }

    async getServer(serverID: string): Promise<Server | null> {
        return await servers.get(serverID).run(await conn());
    }

    async getAllServers(): Promise<Server[]> {
        return await servers.run(await conn());
    }

    async getExploreServers(): Promise<Partial<any>[]> {
        return (await servers.filter(function (d: any) {
            return d('flags').contains(`PUBLIC`)&&d('deleted').eq(false);
        }).without('banList').merge((x:any)=> {return {owner: users.get(x('ownerId'))}}).run(await conn()));
    }

    async updateServer(server: Server | {id: string}): Promise<void> {
        await servers.get(server.id).update(server).run(await conn());
    }

    async deleteServer(serverId: string) : Promise<void> {
        await servers.get(serverId).update({deleted: true}).run(await conn());
        await members.filter({serverId: serverId}).delete().run(await conn());
        await invites.filter({serverId: serverId}).delete().run(await conn());
        await channels.filter({serverId: serverId}).update({deleted: true}).run(await conn());
        await messages.filter({serverId: serverId}).update({deleted: true}).run(await conn());
        await roles.filter({serverId: serverId}).update({deleted: true}).run(await conn());
    }


    async insertCode(code: AccessCode): Promise<AccessCode> {
        await accessCode.insert(code).run(await conn());
        return code;
    }

    async updateCode(code: AccessCode | {id: string}): Promise<void> {
        await accessCode.get(code.id).update(code).run(await conn());
    }

    async getCode(id: string): Promise<AccessCode> {
        return await accessCode.get(id).run(await conn());
    }

    async deleteCode(code: AccessCode | {id: string}): Promise<void> {
        await accessCode.get(code.id).delete().run(await conn())
    }

    async getCodes(): Promise<AccessCode[]> {
        let codes : any[] =  await accessCode.merge((x:any) =>{
            return {user: users.get(x('reedemBy')).default(null)};
        }).run(await conn());
        await Promise.all(codes.map(async (a:any) =>{
            return a.user !=null ? a.user = exportUserSchema.parse(a.user) : a.user=null;
        }));
        return codes;
    }



    async insertMember(member: Member): Promise<Member> {
        await members.insert(member).run(await conn());
        return member;
    }

    async updateMember(member: Member): Promise<void> {
        await members.get(member.id).update(member).run(await conn());
    }

    async deleteMember(member: Member | null): Promise<void> {
        await members.get(member?.id).delete().run(await conn());
    }

    async giveMembersEveryoneRole(serverId: string): Promise<void> {
        await members.filter((x: any) => x("serverId").eq(serverId).and(x("roles").contains(serverId).not())).update((x: any) => x("roles").default([]).append(serverId)).run(await conn());
    }


    async insertEntity(entity: Entity): Promise<Entity> {
        await entities.insert(entity).run(await conn());
        return entity;
    }

    async getEntity(entityID: string): Promise<any | null> {
        return await entities.get(entityID).run(await conn());
    }

    async getEntities(channelId: string, type: string, deleted?: boolean): Promise<Entity[] | null> {
        return await entities.filter({channelId: channelId, type: type, deleted: (typeof deleted == "undefined" ? true : deleted)}).run(await conn());
    }

    async updateEntity(entity: Entity): Promise<void> {
        await entities.get(entity.id).update(entity).run(await conn());
    }

    async deleteEntity(entity: Entity): Promise<void> {
        await entities.get(entity.id).update({deleted: false}).run(await conn());
    }


    async insertChannel(channel: Channel): Promise<Channel> {
        await channels.insert(channel).run(await conn());
        return channel;
    }

    async getChannel(channelID: string): Promise<Channel | null> {
        return await channels.get(channelID).run(await conn());
    }

    async updateChannel(channel: Channel): Promise<void> {
        await channels.get(channel.id).update(channel).run(await conn());
    }

    async deleteChannel(channel: Channel): Promise<void> {
        await channels.get(channel.id).update({deleted: false}).run(await conn());
    }



    async insertRole(role: Role): Promise<Role> {
        await roles.insert(role).run(await conn());
        return role;
    }

    async updateRole(role: Role): Promise<void> {
        await roles.get(role.id).update(role).run(await conn());
    }

    async getRole(role: string): Promise<Role | null> {
        return await roles.get(role).run(await conn());
    }

    async getDefaultRole(role: string): Promise<Role | null> {
        return await roles.get(role).run(await conn());
    }

    async deleteRole(role: Role): Promise<void> {
        await roles.get(role.id).update({deleted: true}).run(await conn());
        await members.filter(function(d:any){
            return d('serverId').eq(role.serverId)&&d('roles').contains(role.id)
        }).update(function(d: any){
            return {roles: d('roles').filter(function (roles: any){
                return roles.ne(role.id);
            })};
        }).run(await conn());
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

    async getLastMessages(serverID: string, channelID: string): Promise<Message[]> {
        let a: Message[] = await messages.orderBy({index: r.desc("timestamp")}).filter(function (d: any) {
            return d('serverId').eq(serverID) && d('channelId').eq(channelID)
        }).limit(20).run(await conn());
        return a.sort((b, c)=> b.timestamp - c.timestamp);
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
