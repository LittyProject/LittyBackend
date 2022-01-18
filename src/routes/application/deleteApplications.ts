import express from 'express';
import db from "../../db";
import {messages} from "../../models/responseMessages";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let a = await db.getUserApplications(req.user.id);
        if(!a) return res.error(messages.NOT_FOUND);
        const app = a.find(x => x.id == req.params.id);
        if(!app) return res.error(messages.NOT_FOUND);
        await db.deleteApplication(app.id);
        emit(req.user.id, 'userDeleteApplication', app);
        return res.success("Application has been deleted");
    } catch(err) {
        return res.error(err);
    }
}
