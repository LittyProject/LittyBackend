import * as z from 'zod';

export const messageSchema = z.object({
    id: z.string(),
    content: z.string().min(1, {message: "Must be 1 or more characters long"}).max(1500, {message: "Must be 1500 or fewer characters long"}),
    authorId: z.string(),
    createdAt: z.date(),
    serverId: z.string(),
    channelId: z.string(),
    type: z.string(),
    poll: z.object({
        title: z.string().max(45),
        options: z.array(z.object({
           name: z.string().max(150),
           emoji: z.string().max(30),
           vote: z.array(z.string()),
        })),
        time: z.number().or(z.string())
    }).optional(),
    embed: z.object({
        title: z.string().max(45).optional(),
        description: z.string().max(1024).optional(),
        thumbnail: z.string().url({message: "thumbnail must be url"}).optional(),
        image: z.string().url({message: "image must be url"}).optional(),
        fields: z.array(z.object({
            name: z.string().max(50),
            value: z.string().max(200),
            inline: z.boolean().optional(),
        }))
    }).optional(),
});

export type Message = z.infer<typeof messageSchema>;

export const serverEditSchema = z.object({
    content: z.string().min(1, {message: "Must be 1 or more characters long"}).max(1500, {message: "Must be 1500 or fewer characters long"}),
});