import * as z from 'zod';
const inviteSchema = {
    guild: z.object({
        id: z.string(),
        name: z.string(),
        ownerId: z.string(),
        members: z.object({
            online: z.number(),
            offline: z.number(),
            all: z.number()
        }),
    }),
    inviter: z.object({
        id: z.string(),
        username: z.string(),
        avatarURL: z.string(),
        tag: z.string(),
    })
}