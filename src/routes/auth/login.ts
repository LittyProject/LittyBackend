import express from 'express';
const router = express.Router();
import { userLoginSchema } from "../../models/user";
import db from "../../db";
import * as f from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        const credentials = userLoginSchema.parse(req.body);

        const userDB = await db.getUserByEmail(credentials.email);
        if(!userDB) {
            throw 'invalid credentials';
        } else {
            if(await f.compareHash(credentials.password, userDB.password)){
                return res.success(userDB);
            } else {
                throw 'invalid credentials';
            }
        }
    } catch(err) {
        return res.error(err);
    }
}