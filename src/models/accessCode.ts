import * as z from "zod";


export const accessCodeSchema = z.object({
    id: z.string(),
    reedemBy: z.string().optional(),
    reedem: z.boolean(),
    timestamp: z.number(),
    end: z.number()
});

export const accessCodeUpdate = z.object({
    reedemBy: z.string(),
});

export type AccessCode = z.infer<typeof accessCodeSchema>;
