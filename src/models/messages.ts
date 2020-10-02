import * as z from 'zod';

const messageSchema = z.object({
    id: z.string(),
    content: z.string().min(1).max(1500),
    authorId: z.string(),
    createdAt: z.date(),
    channelId: z.string()
});

export type Message = z.infer<typeof messageSchema>;

export const serverEditSchema = z.object({
    content: z.string().min(1).max(1500)
});