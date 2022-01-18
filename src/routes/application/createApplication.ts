import express from 'express';
import db from "../../db";
import {Application, presenceSchema} from "../../models/application";
import * as f from "../../functions";
import {createApp} from "../../models/payload";
import {messages} from "../../models/responseMessages";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const a = await db.getUserApplications(req.user.id);
        // @ts-ignore
        if(a?.length>=10){
            return res.error(messages.TOO_MUCH_APPS);
        }
        if(!createApp.safeParse(req.body).success){
            return res.error(messages.INVALID_DATA);
        }
        let appSchema = createApp.parse(req.body);
        const app : Application = {
            id: f.genID(),
            name: appSchema.name,
            createdAt: new Date(),
            owner: req.user.id,
            token: f.createID(40)
        }
        await db.insertApplication(app);
        emit(req.user.id, 'userCreateApplication', app);
        return res.success(app)
    } catch(err) {
        return res.error(err);
    }
}
