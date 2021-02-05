import * as z from 'zod';
import {userSchema} from "./user";
export const inviteSchema = z.object({
    id: z.string(),
    code: z.string(),
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
});

export type Invite = z.infer<typeof inviteSchema>;