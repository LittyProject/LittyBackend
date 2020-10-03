import * as z from 'zod';

export const channelSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    createdAt: z.date(),
    serverId: z.string()
});

export type Channel = z.infer<typeof channelSchema>;

export const channelEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"})
});