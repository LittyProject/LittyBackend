import * as z from 'zod';
import {serverFlags} from "./enum";
import {exportMemberSchema, memberSchema} from "./member";
import {exportChannelSchema} from "./channel";
import {roleSchema} from "./role";
import {inviteSchema} from "./invite";
const config = require("../../config.json");

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
    description: z.string().min(0).max(150).default("")
})

const serverSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    iconURL: z.string().url({message: "Must contains web URL"}).default(`${process.env.cdnURL}/${config.cdn.server.icon.path}/default.png`),
    banner: z.string().url({message: "Must contains web URL"}).default(`${process.env.cdnURL}/${config.cdn.server.banner.path}/default.png`),
    banList: z.array(z.object({
        id: z.string(),
        reason: z.string()
    })),
    info: serverInfo.default({
        description: "",
        tags: []
    }),
    flags: z.array(z.enum(serverFlags as [string, ...string[]])),
    ownerId: z.string(),
    createdAt: z.date(),
    deleted: z.boolean().default(false)
});


export const updateFlags = z.object({
    flags: z.array(z.enum(serverFlags as [string, ...string[]])),
})

export type Server = z.infer<typeof serverSchema>;

export const serverEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    iconURL: z.string().url({message: "Must contains web URL"}).optional(),
    flags: z.array(z.string()).optional(),
    info: serverInfo.optional(),
    banner: z.string().url({message: "Must contains web URL"}).optional(),
});


export type ExportServer = z.infer<typeof exportServerSchema>;

const exportServerSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    iconURL: z.string().url({message: "Must contains web URL"}).default(`${process.env.cdnURL}/${config.cdn.server.icon.path}/default.png`),
    banner: z.string().url({message: "Must contains web URL"}).default(`${process.env.cdnURL}/${config.cdn.server.banner.path}/default.png`),
    banList: z.array(z.object({
        id: z.string(),
        reason: z.string()
    })),
    info: serverInfo.default({
        description: "",
        tags: []
    }),
    flags: z.array(z.enum(serverFlags as [string, ...string[]])),
    ownerId: z.string(),
    createdAt: z.date(),
    deleted: z.boolean().default(false),
    members: z.array(memberSchema).or(z.array(exportMemberSchema)).optional(),
    channels: z.array(exportChannelSchema).optional(),
    roles: z.array(roleSchema).optional(),
    invites: z.array(inviteSchema).optional(),
});



