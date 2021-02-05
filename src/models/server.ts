import * as z from 'zod';

const serverSchema = z.object({
    id: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    iconURL: z.string().url({message: "Must contains web URL"}),
    banList: z.array(z.object({
        id: z.string(),
        reason: z.string()
    })),
    members: z.array(z.object({
        id: z.string(),
        username: z.string().min(3, {message: "Must be 3 or more characters long"}).max(24, {message: "Must be 24 or fewer characters long"}),
        avatarURL: z.string().url({message: "Must contains web URL"}),
        tag: z.string().length(4, {message: "Must be 4 characters long"}),

        banned: z.boolean(),
        bot: z.boolean(),
        createdBy: z.string(),
        createdAt: z.date(),

        customStatus: z.string().min(0).max(50, {message: "Must be 50 or fewer characters long"}),
        status: z.number().min(0, {message: "Must be >= 0"}).max(14, {message: "Must be <= 14"}),
        badges: z.array(z.number()),

        deleted: z.boolean(),

        perm: z.number()
    })),
    channels: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
        createdAt: z.date()
    })).max(50, {message: "Server can only have 50 channels"}),
    ownerId: z.string(),
    createdAt: z.date()
});

export type Server = z.infer<typeof serverSchema>;

export const serverEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"})
});

export const channelEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"})
});
