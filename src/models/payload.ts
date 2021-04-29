import * as z from 'zod';
import {perms, serverInfo} from "./server";
import {serverFlags} from "./enum";

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
})