import * as z from 'zod';

const userSchema = z.object({
    id: z.string(),
    username: z.string().min(3).max(24),
    avatarURL: z.string(),
    tag: z.string().min(4).max(4),
    bot: z.boolean(),
    status: z.string(),
    badges: z.array(z.number()),
    
    email: z.string(),
    password: z.string().min(8).max(32),
    token: z.string(),
    servers: z.array(z.string()),

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