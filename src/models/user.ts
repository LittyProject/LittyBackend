import * as z from 'zod';

const userSchema = z.object({
    id: z.string(),
    username: z.string().min(3).max(24),
    avatarURL: z.string(),
    tag: z.string().min(4).max(4),

    banned: z.boolean(),
    bot: z.boolean(),
    createdBy: z.string(),
    createdAt: z.date(),

    customStatus: z.string().min(0).max(50),
    // 0=online, 1=idle, 2=dnd, 3=coding, 4=watching, 5=listening, 6=playing, 7=offline
    status: z.number().min(0).max(7),
    badges: z.array(z.number()),
    
    email: z.string(),
    password: z.string().min(8).max(32),
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
    password: z.string().min(1),
});

export const userRegisterSchema = z.object({
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: passwordSchema,
    username: z.string().min(3).max(24),
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

export type User = z.infer<typeof userSchema>;