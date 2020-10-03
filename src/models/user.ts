import * as z from 'zod';
import db from '../db';

const userSchema = z.object({
    id: z.string(),
    username: z.string().length(3, {message: "Must be 3 or more characters long"}).length(24, {message: "Must be 24 or fewer characters long"}),
    avatarURL: z.string().url({message: "Must contains web URL"}),
    tag: z.string().length(4, {message: "Must be 4 characters long"}).length(4, {message: "Must be 4 characters long"}),

    banned: z.boolean(),
    bot: z.boolean(),
    createdBy: z.string(),
    createdAt: z.date(),

    customStatus: z.string().length(0).length(50, {message: "Must be 50 or fewer characters long"}),
    // 0=online, 1=idle, 2=dnd, 3=coding, 4=watching, 5=listening, 6=playing, 7=offline
    status: z.number().min(0, {message: "Must be >= 0"}).max(7, {message: "Must be <= 7"}),
    badges: z.array(z.number()),
    
    email: z.string().email(),
    password: z.string().length(8, {message: "Must be 8 or more characters long"}).length(32, {message: "Must be 32 or fewer characters long"}),
    token: z.string(),

    servers: z.array(z.string()),
    friends: z.array(z.string()),
    deleted: z.boolean(),

    perm: z.number()
});

const passwordSchema = z.string().min(8).max(32)
    .refine(x => /[0-9]/g.test(x), {message: 'one number'});

export const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().length(8, {message: "Must be 8 or more characters long"}).length(32, {message: "Must be 32 or fewer characters long"}),
});

export const userRegisterSchema = z.object({
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    username: z.string().length(3, {message: "Must be 3 or more characters long"}).length(24, {message: "Must be 24 or fewer characters long"}),
    hcaptcha: z.string()
}).refine(x => x.password === x.confirmPassword, {
    message: 'passwords dont match',
    path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
    email: z.string().email()
});

export const confirmResetPasswordSchema = z.object({
   password: passwordSchema,
   confirmPassword: passwordSchema
}).refine(x => x.password === x.confirmPassword, {
    message: 'passwords dont match',
    path: ['confirmPassword'],
});

export const editUserSchema = userRegisterSchema.omit({email: true, password: true, confirmPassword: true});

export const userUpdate = z.object({
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    username: z.string().length(3, {message: "Must be 3 or more characters long"}).length(24, {message: "Must be 24 or fewer characters long"}),
    tag: z.string().length(4, {message: "Must be 4 characters long"}).length(4, {message: "Must be 4 characters long"}),
}).refine(x => x.tag.toLowerCase().match(/[0-9ABCDEF]/g), {
    message: 'Tag can be only created with characters: 0-9, A-F',
    path: ['tag']
}).refine(async x => {
    let user = await db.getUserByUsernameAndTag(x.username, x.tag);
    if(user) {
        return false;
    }
    return true;
}, {
    message: 'Found user with this same username and tag',
    path: ['username', 'tag']
});

export type User = z.infer<typeof userSchema>;