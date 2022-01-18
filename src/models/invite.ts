import * as z from 'zod';
export const inviteSchema = z.object({
    id: z.string(),
    code: z.string(),
    serverId: z.string(),
    inviterId: z.string(),
    timestampCreated: z.number(),
    timestampEnd: z.number().optional(),
});

export type Invite = z.infer<typeof inviteSchema>;
