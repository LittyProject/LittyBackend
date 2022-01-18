
import * as z from 'zod';


export const entitySchema = z.object({
    id: z.string().optional(),
    serverId: z.string(),
    channelId: z.string(),
    type: z.string(),
    name: z.string(),
    timestamp: z.number(),
    createdBy: z.string(),
    deleted: z.boolean().default(false)
})

export type Entity = z.infer<typeof entitySchema>;