import * as z from "zod";
import {perms} from "./permission";

export const roleSchema = z.object({
    id: z.string(),
    serverId: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    timestamp: z.number(),
    position: z.number(),
    perms:  z.array(perms),
    createdAt: z.date(),
    deleted: z.boolean().default(false),
    color: z.string()
});

export const roleEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    position: z.number(),
    color: z.string().optional(),
    perms:  z.array(perms).optional(),
});

export type Role = z.infer<typeof roleSchema>;


