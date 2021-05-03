import * as z from 'zod';
import {userSchema} from "./user";


export const applicationSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.date(),
    owner: z.string(),
    bot: z.string().optional(),
    token: z.string()
})

export const presenceSchema = z.object({
    type: z.number(),
    icon: z.string().url(),
    presence: z.object({
        title: z.string(),
        subtitle: z.string(),
    })
})

export type Application = z.infer<typeof applicationSchema>;