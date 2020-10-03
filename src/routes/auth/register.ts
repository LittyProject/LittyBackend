import express from 'express';
const router = express.Router();
import { userRegisterSchema, User } from "../../models/user";
import db from "../../db";
import * as f from '../../functions';
import {verify} from "hcaptcha";

export default async function(req: express.Request, res: express.Response) {
    try {
        let model = {
            hcaptcha: req.body.hcaptcha,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            username: req.body.username
        };
        let credentials = userRegisterSchema.parse(model);

        /*try {
            const data = await verify(process.env.HCAPTCHA_SECRET || '', credentials.hcaptcha);
            if(!data.success) throw 'captcha failed';
        } catch(err) {
            throw 'captcha failed';
        }*/

        let check = await db.getUserByEmail(credentials.email);
        if(check) {
            throw 'email claimed';
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

            customStatus: "",
            // 0=online, 1=idle, 2=dnd, 3=coding, 4=watching, 5=listening, 6=playing, 7=offline
            status: 0,
            badges: [],
            
            email: credentials.email,
            password: await f.hashPassword(credentials.password),
            token: f.createID(40),

            servers: [],
            friends: [],
            deleted: false,

            perm: 0
        };
        
        await db.insertUser(user);
        return res.success(user);
    } catch(err) {
        if(err !== "captcha failed" || err !== "email claimed") {
            //err = "invalid credentials"
        }
        return res.error(err);
    }
}