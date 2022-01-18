import * as z from 'zod';
import {serverInfo} from "./server";
import {realseChannel, serverFlags, userFlags} from "./enum";
import {perms} from "./permission";

export const updateChannel = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
});

export const updateServer = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}).optional(),
    iconURL: z.string().url({message: "Must contains web URL"}).optional(),
    banner: z.string().url({message: "Must contains web URL"}).optional(),
    info: serverInfo.optional(),
    ownerId: z.string().optional(),
    flags: z.array(z.enum(serverFlags as [string, ...string[]])).optional(),
});

export const updateRole = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}).optional(),
    position: z.number().optional(),
    color: z.string().optional(),
    member: z.string().optional(),
    perms:  z.array(perms).optional(),
});

export const manageUser = z.object({
    username: z.string().min(3, {message: "Must be 3 or more characters long"}).max(24, {message: "Must be 24 or fewer characters long"}).optional(),
    avatarURL: z.string().url({message: "Must contains web URL"}).optional(),
    tag: z.string().length(4, {message: "Must be 4 characters long"}).optional(),
    banned: z.boolean().optional(),
    flags: z.array(z.enum(userFlags as [string, ...string[]])).optional(),
    disabled: z.boolean().optional(),
    deleted: z.boolean().optional(),
});

export const createApp = z.object({
    name: z.string(),
});

export const editApp = z.object({
    name: z.string(),
});

export const createChangelog = z.object({
    title: z.string(),
    description: z.string(),
    content: z.string(),
    type: z.string().refine(x => realseChannel.includes(x), {message: 'Unknow realse type'})
})
