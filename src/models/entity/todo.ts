import * as z from 'zod';
import {entitySchema} from "./entity";

export const todoCard = z.object({
    title: z.string().min(3).max(50),
    description: z.string().min(3).max(200).optional(),
    type: z.string().refine(a=> ['CLOSED', 'OPEN'].includes(a), {message: "Invalid type"}),
    createdBy: z.string(),
    timestamp: z.number(),
    label: z.array(z.string()).default([]),
    members: z.array(z.string()).default([])
})


export const todoSchema = entitySchema.extend({
    type: z.string().default('todo'),
    children: z.array(todoCard).default([])
})

export type Todo = z.infer<typeof todoSchema>;
export type TodoCard = z.infer<typeof todoCard>;