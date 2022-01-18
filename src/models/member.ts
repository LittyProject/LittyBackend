import * as z from "zod";
import {userFlags} from "./enum";

export const memberSchema = z.object({
    id: z.string(),
    serverId: z.string(),
    memberId: z.string(),
    nickname: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}).nullable().default(null),
    joinedAt: z.date(),
    roles: z.array(z.string())
});

export const exportMemberSchema = z.object({
    id: z.string(),
    serverId: z.string(),
    memberId: z.string(),
    nickname: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}).nullable().default(null),
    joinedAt: z.date(),
    roles: z.array(z.string()),

    customStatus: z.string().min(0).max(50, {message: "Must be 50 or fewer characters long"}).optional(),
    status: z.number().min(0, {message: "Must be >= 0"}).max(15, {message: "Must be <= 15"}).optional(),
    onlineStatus: z.number().min(0, {message: "Must be >= 0"}).max(15, {message: "Must be <= 15"}).optional(),

    createdAt: z.date().optional(),
    bot: z.boolean().optional(),
    deleted: z.boolean().optional(),
    disabled: z.boolean().optional(),
    flags: z.array(z.enum(userFlags as [string, ...string[]])).optional(),
    banned: z.boolean().optional(),

    username: z.string().min(3, {message: "Must be 3 or more characters long"}).max(24, {message: "Must be 24 or fewer characters long"}).optional(),
    avatarURL: z.string().url({message: "Must contains web URL"}).optional(),
    about: z.string().max(450, {message: "Must be 450 or fewer characters long"}).optional(),
    bannerURL: z.string().url({message: "Must contains web URL"}).optional(),
    tag: z.string().length(4, {message: "Must be 4 characters long"}).optional(),
});

export type Member = z.infer<typeof memberSchema>;
export type ExportMember = z.infer<typeof exportMemberSchema>;
