import * as z from 'zod';

export const channelSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(24),
    createdAt: z.date(),
    serverId: z.string()
});

export type Channel = z.infer<typeof channelSchema>;

export const channelEditSchema = z.object({
    name: z.string().min(1).max(24)
});