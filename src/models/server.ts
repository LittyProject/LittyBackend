import * as z from 'zod';
import {channelSchema} from "./channels";

const serverSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    iconURL: z.string().url({message: "Must contains web URL"}),
    banList: z.array(z.object({
        id: z.string(),
        reason: z.string()
    })),
    channels: channelSchema,
    ownerId: z.string(),
    createdAt: z.date()
});

export type Server = z.infer<typeof serverSchema>;

export const serverEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"})
});