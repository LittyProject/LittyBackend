import * as z from 'zod';
import {applicationSchema} from "./application";

export const changelog = z.object({
    title: z.string(),
    description: z.string(),
    createdAt: z.number(),
    author: z.string(),
    content: z.string()
});

export type Changelog = z.infer<typeof changelog>;