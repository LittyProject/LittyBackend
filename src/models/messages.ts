import * as z from 'zod';

const messageSchema = z.object({
    id: z.string(),
    content: z.string().min(1, {message: "Must be 1 or more characters long"}).max(1500, {message: "Must be 1500 or fewer characters long"}),
    authorId: z.string(),
    createdAt: z.date(),
    channelId: z.string()
});

export type Message = z.infer<typeof messageSchema>;

export const serverEditSchema = z.object({
    content: z.string().min(1, {message: "Must be 1 or more characters long"}).max(1500, {message: "Must be 1500 or fewer characters long"}),
});