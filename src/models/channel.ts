import * as z from "zod";
import {messageSchema} from "./messages";

export const todoLabel = z.object({
    name: z.string().min(1).max(20),
    value: z.string().min(1).max(20),
    color: z.string().min(1).max(100)
})

export const channelEditSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}).optional(),
    type: z.number().positive().optional(),
    position: z.number().positive().optional(),
    label: z.array(todoLabel).optional()
});

export const channelCreateSchema = z.object({
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    type: z.number().positive(),
    position: z.number().positive(),
    label: z.array(todoLabel).optional()
});

export const channelSchema = z.object({
    id: z.string(),
    serverId: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    createdAt: z.date(),
    position: z.number().positive(),
    type: z.number().positive(),
    deleted: z.boolean().default(false),
    label: z.array(todoLabel).optional(),
    typing: z.array(z.string()).default([]),
});

export type Channel = z.infer<typeof channelSchema>;

export type ExportChannel = z.infer<typeof exportChannelSchema>;

export const exportChannelSchema = z.object({
    id: z.string(),
    serverId: z.string(),
    name: z.string().min(1, {message: "Must be 1 or more characters long"}).max(30, {message: "Must be 30 or fewer characters long"}),
    createdAt: z.date(),
    position: z.number().positive(),
    type: z.number().positive(),
    deleted: z.boolean().default(false),
    messages: z.array(messageSchema).optional(),
    typing: z.array(z.string()).default([]),
});
