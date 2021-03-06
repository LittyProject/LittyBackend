import express from 'express';
import { userRegisterSchema, User } from "../../models/user";
import db from "../../db";
import * as f from '../../functions';
import {verify} from "hcaptcha";
import { messages } from '../../models/responseMessages';

export default async function(req: express.Request, res: express.Response) {
    try {
        let model = {
            hcaptcha: req.body.hcaptcha || "",
            email: req.body.email,
            password: req.body.password,
            username: req.body.username
        };
        let credentials = userRegisterSchema.parse(model);

        /*try {
            const data = await verify(process.env.HCAPTCHA_SECRET || '', credentials.hcaptcha);
            if(!data.success) throw messages.CAPTCHA_ERROR;
        } catch(err) {
            throw messages.CAPTCHA_ERROR;
        }*/

        let check = await db.getUserByEmail(credentials.email);
        if(check) {
            throw messages.EMAIL_CLAIMED;
        }

        const user: User = {
            id: f.genID(),
            username: credentials.username,
            avatarURL: process.env.cdnURL + "/def_user.png",
            tag: f.createTag(),

            banned: false,
            bot: false,
            createdBy: "",
            createdAt: new Date(),

            customStatus: "Witaj! Jestem tu nowy/a",
            status: 15,
            onlineStatus: 15,
            flags: [],

            email: credentials.email,
            password: await f.hashPassword(credentials.password),
            token: f.createID(40),
            lastIP: '',

            servers: [],
            friendRequests: [],
            friends: [],
            disabled: false,
            deleted: false,
        };

        console.log(user);

        await db.insertUser(user);
        return res.success(user);
    } catch(err) {
        console.log(err);
        return res.authError(err);
    }
}
