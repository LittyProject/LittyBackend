import * as z from 'zod';
import db from '../db';
import {themeType, userFlags, realseChannel} from "./enum";

export const userLinkSchema = z.object({
    url: z.string().url({message: "Page url error"}),
    name: z.string().min(3).max(90),
    icon: z.string().min(2).max(35)

})

export const deviceData = z.object({
    push: z.string()
})

export const deviceSchema = z.object({
    name: z.string(),
    version: z.string(),
    platform: z.string().refine(x => realseChannel.includes(x), {message: 'Invalid device type'}),
    id: z.string(),
    data: deviceData.optional(),
})

export const userSchema = z.object({
    id: z.string(),
    username: z.string().min(3, {message: "Must be 3 or more characters long"}).max(24, {message: "Must be 24 or fewer characters long"}),
    avatarURL: z.string().url({message: "Must contains web URL"}),
    about: z.string().max(450, {message: "Must be 450 or fewer characters long"}),
    bannerURL: z.string().url({message: "Must contains web URL"}),
    tag: z.string().length(4, {message: "Must be 4 characters long"}),

    banned: z.boolean(),
    flags: z.array(z.enum(userFlags as [string, ...string[]])),
    bot: z.boolean(),
    createdBy: z.string(),
    createdAt: z.date(),

    customStatus: z.string().min(0).max(50, {message: "Must be 50 or fewer characters long"}),
    status: z.number().min(0, {message: "Must be >= 0"}).max(15, {message: "Must be <= 15"}),
    onlineStatus: z.number().min(0, {message: "Must be >= 0"}).max(15, {message: "Must be <= 15"}),

    email: z.string().email(),
    password: z.string().min(8, {message: "Must be 8 or more characters long"}).max(32, {message: "Must be 32 or fewer characters long"}),
    token: z.string(),
    lastIP: z.string(),

    friends: z.array(z.string()),
    sentFriendRequests: z.array(z.string()),
    friendRequests: z.array(z.string()),

    disabled: z.boolean(),
    deleted: z.boolean(),

    //new Profile Data
    cardColor: z.string().max(20).default('#2196F3'),
    bannerColor: z.string().max(20).default('#9C27B0'),
    profileLinks: z.array(userLinkSchema).max(5, {message: "You are have 5 links now"}).default([]),
    theme: z.string().refine(x => themeType.includes(x), {message: 'Invalid theme type'}).default('light'),

    //Devices
    devices: z.array(deviceSchema).optional()
});


export const exportUserSchema = z.object({
    id: z.string(),
    username: z.string().min(3, {message: "Must be 3 or more characters long"}).max(24, {message: "Must be 24 or fewer characters long"}),
    avatarURL: z.string().url({message: "Must contains web URL"}),
    about: z.string().max(450, {message: "Must be 450 or fewer characters long"}).optional(),
    bannerURL: z.string().url({message: "Must contains web URL"}).optional(),
    tag: z.string().length(4, {message: "Must be 4 characters long"}),

    banned: z.boolean(),
    bot: z.boolean(),
    createdBy: z.string(),
    createdAt: z.date(),

    customStatus: z.string().min(0).max(50, {message: "Must be 50 or fewer characters long"}),
    status: z.number().min(0, {message: "Must be >= 0"}).max(15, {message: "Must be <= 15"}),
    onlineStatus: z.number().min(0, {message: "Must be >= 0"}).max(15, {message: "Must be <= 15"}),
    flags: z.array(z.enum(userFlags as [string, ...string[]])),
    deleted: z.boolean(),
    disabled: z.boolean(),

    //new Profile Data
    cardColor: z.string().max(20).default('#2196F3'),
    bannerColor: z.string().max(20).default('#9C27B0'),
    profileLinks: z.array(userLinkSchema).max(5, {message: "You are have 5 links now"}).default([]),
    theme: z.string().refine(x => themeType.includes(x), {message: 'Invalid theme type'}).default('light')
});


export const exportMinimalUserSchema = z.object({
    id: z.string(),
    username: z.string().min(3, {message: "Must be 3 or more characters long"}).max(24, {message: "Must be 24 or fewer characters long"}),
    avatarURL: z.string().url({message: "Must contains web URL"}),
    tag: z.string().length(4, {message: "Must be 4 characters long"}),

    banned: z.boolean(),
    bot: z.boolean(),
    createdBy: z.string(),

    flags: z.array(z.enum(userFlags as [string, ...string[]])),
    deleted: z.boolean(),
    disabled: z.boolean(),

});

export const updateFlags = z.object({
    flags: z.array(z.enum(userFlags as [string, ...string[]])),
})

const passwordSchema = z.string().min(8).max(32)
    .refine(x => /[0-9]/g.test(x), {message: 'one number'});

export const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, {message: "Must be 8 or more characters long"}).max(32, {message: "Must be 32 or fewer characters long"}),
});

export const userRegisterSchema = z.object({
    email: z.string().email(),
    code: z.string(),
    password: passwordSchema,
    username: z.string().min(3, {message: "Must be 3 or more characters long"}).max(24, {message: "Must be 24 or fewer characters long"}),
    hcaptcha: z.string()
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

export const updateCustomStatus = z.object({
    customStatus: z.string().min(0).max(50, {message: "Must be 50 or fewer characters long"}).optional(),
    status: z.number().optional(),
    onlineStatus: z.number().optional()
});


export const userUpdate = z.object({
        email: z.string().email().optional(),
        password: passwordSchema.optional(),
        avatarURL: z.string().url({message: "Must contains web URL"}).optional(),
        about: z.string().max(450, {message: "Must be 450 or fewer characters long"}).optional(),
        bannerURL: z.string().url({message: "Must contains web URL"}).optional(),
        customStatus: z.string().min(0).max(50, {message: "Must be 50 or fewer characters long"}).optional(),
        status: z.number().optional(),
        onlineStatus: z.number().optional(),
        //new Profile Data
        cardColor: z.string().max(20).optional(),
        bannerColor: z.string().max(20).optional(),
        theme: z.string().refine(x => themeType.includes(x), {message: 'Invalid theme type'}).optional(),
        profileLinks: z.array(userLinkSchema).max(5, {message: "You are have 5 links now"}).optional(),
        devices: z.array(deviceSchema).optional()
    }

);

export type User = z.infer<typeof userSchema>;
//export type Member = z.infer<typeof exportUserSchema>;

// username: z.string().min(3, {message: "Must be 3 or more characters long"}).max(24, {message: "Must be 24 or fewer characters long"}),
// tag: z.string().length(4, {
//     message: "Must be 4 characters long"}),
// }).refine(x => x.tag.toLowerCase().match(/[0-9ABCDEF]/g), {
//     message: 'Tag can be only created with characters: 0-9, A-F',
//     path: ['tag']
// }).refine(async x => {
//     let user = await db.getUserByUsernameAndTag(x.username, x.tag);
//     return !user;
// }, {
//     message: 'Found user with this same username and tag',
//     path: ['username', 'tag']
// }
