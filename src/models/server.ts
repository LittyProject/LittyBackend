import * as z from 'zod';
import {serverFlags} from "./enum";

export const channelSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    createdAt: z.date(),
    type: z.number(),
});

export const rolePerms: string[] = [
    'SEND_MESSAGE',
    'ADD_FILE',
    'MANAGE_MESSAGES',
    'MANAGE_SERVER',
    'MANAGE_CHANNELS',
    'MANAGE_ROLES',
    'MANAGE_INVITES',
    'ADMINISTRATOR',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'CREATE_INVITES',
    'LIST_VIEW'
];

export const perms = z.object({
    name: z.string().refine(a=> rolePerms.includes(a),{
        message: "Unknow perms"
    }),
    type: z.boolean()
})

export const defaultPerms = function(){
    let a : Permission[] = [];
    rolePerms.forEach(b=>{
        if(b==='SEND_MESSAGE'||b==="ADD_FILE"||b=="CREATE_INVITES"){
            a.push({name: b, type: true});
        }else{
            a.push({name: b, type: false});
        }
    })
    return a;
}


export const serverTags: string[] = [
    'community',
    'programming',
    'technology',
    'youtube',
    'hobby',
    'gaming',
    'other'
];

export const serverInfo = z.object({
    tags: z.array(z.enum(serverTags as [string, ...string[]])),
    description: z.string().min(3).max(100)
})

const roleSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    timestamp: z.number(),
    position: z.number(),
    perms:  z.array(perms),
    color: z.string(),
    members: z.array(z.string())
});



const serverSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    iconURL: z.string().url({message: "Must contains web URL"}),
    banner: z.string().url({message: "Must contains web URL"}).optional(),
    banList: z.array(z.object({
        id: z.string(),
        reason: z.string()
    })),
    invites: z.array(z.string()).optional(),
    info: serverInfo.optional(),
    roles: z.array(roleSchema),
    flags: z.array(z.enum(serverFlags as [string, ...string[]])),
    channels: z.array(channelSchema).max(50, {message: "Server can only have 50 channels"}),
    ownerId: z.string(),
    createdAt: z.date()
});


export const updateFlags = z.object({
    flags: z.array(z.enum(serverFlags as [string, ...string[]])),
})

export type Server = z.infer<typeof serverSchema>;
export type Channel = z.infer<typeof channelSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Permission = z.infer<typeof perms>;

export const serverEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    iconURL: z.string().url({message: "Must contains web URL"}).optional(),
    flags: z.array(z.string()).optional(),
    info: serverInfo.optional(),
    banner: z.string().url({message: "Must contains web URL"}).optional(),
});

export const channelEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    type: z.number(),
});

export const roleEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    position: z.number(),
    color: z.string(),
    perms:  z.array(perms),
});
