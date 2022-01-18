import * as z from 'zod';

export const staffMessageSchema = z.object({
    id: z.string().optional(), //Message big id
    from: z.string(), //Developer Id
    to: z.string(), //Staff User Id,
    read: z.boolean(), //If Staff User Mark Read
    title: z.string(), //Message Title
    content: z.string(), //Message Content
    createdAt: z.number(), //Unix Message Created
});

export const staffMessageCreateSchema = z.object({
    title: z.string(), //Message Title
    content: z.string(), //Message Content
});

export type StaffMessage = z.infer<typeof staffMessageSchema>;