import express from 'express';
import db from "../../db";
import {emit, sendPushToUser} from "../../functions";
import {StaffMessage, staffMessageCreateSchema, staffMessageSchema} from "../../models/staffmessage";
import {messages} from "../../models/responseMessages";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized();
        if(!req.params.id) return res.error(messages.INVALID_DATA);
        if(!staffMessageCreateSchema.safeParse(req.body).success){
            return res.error(messages.INVALID_DATA);
        }
        const a = await db.getUser(req.params.id);
        if(!a){
            return res.error(messages.NOT_FOUND);
        }
        let msgSchema = staffMessageCreateSchema.parse(req.body);
        const app : StaffMessage = {
            read: false,
            title: msgSchema.title,
            content: msgSchema.content,
            from: req.user.id,
            to: a.id,
            createdAt: new Date().getTime()
        }
        await db.insertStaffMessage(app);
        emit(app.to,  'createStaffMessage', app);
        sendPushToUser(`${app.to}`, `✨ Otrzymałeś wiadomość od zespołu Litty`, `Tytuł: ${app.title}`, 'staff_alert');
        return res.success(app)
    } catch(err) {
        return res.error(err);
    }
}