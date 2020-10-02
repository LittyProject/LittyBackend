import * as z from 'zod';
import {User} from "./user";

const messageSchema = z.object({
    id: z.string(),
    content: z.string().min(1).max(24),
    authorId: z.string(),
    createdAt: z.date(),
    channelId: z.string()
});

export type Message = z.infer<typeof messageSchema>;

export const serverEditSchema = z.object({
    content: z.string().min(1).max(24)
});