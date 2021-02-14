import * as z from 'zod';
import {serverFlags} from "./enum";

const channelSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    createdAt: z.date()
});

const serverSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    iconURL: z.string().url({message: "Must contains web URL"}),
    banList: z.array(z.object({
        id: z.string(),
        reason: z.string()
    })),
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

export const serverEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"})
});

export const channelEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"})
});
