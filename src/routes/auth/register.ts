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
            username: req.body.username,
            code:req.body.code
        };

        /*try {
            const data = await verify(process.env.HCAPTCHA_SECRET || '', credentials.hcaptcha);
            if(!data.success) throw messages.CAPTCHA_ERROR;
        } catch(err) {
            throw messages.CAPTCHA_ERROR;
        }*/
        if(!userRegisterSchema.safeParse(model).success){
            return res.error(messages.INVALID_DATA);
        }
        let credentials = userRegisterSchema.parse(model);
        let check = await db.getUserByEmail(credentials.email);
        if(check) {
            return res.error(messages.EMAIL_CLAIMED);
        }
        let code = await db.getCode(model.code);
        if(!code){
            return res.error(messages.CODE_NOT_EXIST);
        }
        if(code.reedem){
            return res.error(messages.ACCESS_CODE_REEDEM);
        }
        const date = Date.now();
        if(date>code.end){
            return res.error(messages.CODE_DURATION_END);
        }

        const user: User = {
            id: f.genID(),
            username: credentials.username,
            avatarURL: process.env.cdnURL + "/cdn/user/avatar/def_user.png",
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

            friendRequests: [],
            sentFriendRequests: [],
            friends: [],
            disabled: false,
            deleted: false,
            cardColor: '#2196F3',
            bannerColor: '#9C27B0',
            bannerURL: process.env.cdnURL + "/cdn/user/avatar/def_user_banner.png",
            profileLinks: [],
            about: 'none',
            theme: 'light'
        };
        code.reedemBy = user.id;
        code.reedem = true;
        await db.insertUser(user);
        const userDB = await db.getUserByEmail(credentials.email);
        await db.updateCode(code);
        return res.success(userDB);
    } catch(err) {
        console.log(err);
        return res.authError(err);
    }
}
