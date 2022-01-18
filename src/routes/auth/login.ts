import express from 'express';
import { userLoginSchema } from "../../models/user";
import db from "../../db";
import * as f from "../../functions";
import { messages } from '../../models/responseMessages';

export default async function(req: express.Request, res: express.Response) {
    try {
        const credentials = userLoginSchema.parse(req.body);

        const userDB = await db.getUserByEmail(credentials.email);
        if(!userDB) {
            return res.error(messages.INVALID_DATA);
        } else {
            if(await f.compareHash(credentials.password, userDB.password)){
                return res.success(userDB);
            } else {
                return res.error(messages.INVALID_DATA);
            }
        }
    } catch(err) {
        console.log(err);
        return res.error(messages.INVALID_DATA);
    }
}
