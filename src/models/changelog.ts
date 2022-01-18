import * as z from 'zod';
import {applicationSchema} from "./application";
import {realseChannel} from "./enum";

export const changelog = z.object({
    title: z.string(),
    description: z.string(),
    createdAt: z.number(),
    author: z.string(),
    content: z.string(),
    type: z.string().refine(x => realseChannel.includes(x), {message: 'Unknow realse type'})
});

export type Changelog = z.infer<typeof changelog>;