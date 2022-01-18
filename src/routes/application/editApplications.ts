import express from 'express';
import db from "../../db";
import { messages } from "../../models/responseMessages";
import {emit} from "../../functions";
import {createApp, editApp} from "../../models/payload";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        const a = await db.getUserApplications(req.user.id);
        if(!a) return res.error(messages.NOT_FOUND);
        const appInfo = a.find(x => x.id == req.params.id);
        if(!appInfo) return res.error(messages.NOT_FOUND);
        if(!editApp.safeParse(req.body).success){
            return res.error(messages.INVALID_DATA);
        }
        const appSchema = editApp.parse(req.body);
        const updatedApp = Object.assign(appInfo, appSchema)
        await db.updateApplication(appInfo.id, appSchema);
        emit(req.user.id, 'userUpdateApplication', updatedApp);
        return res.success(updatedApp)
    } catch(err) {
        return res.error(err);
    }
}
