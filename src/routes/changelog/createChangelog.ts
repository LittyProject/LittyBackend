import express from 'express';
import db from "../../db";
import {createApp, createChangelog} from "../../models/payload";
import {messages} from "../../models/responseMessages";
import * as f from "../../functions";
import {changelog, Changelog} from "../../models/changelog";
import {emitAll} from "../../functions";
import { FirebaseAdmin } from '../../app';



export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized();
        if(!createChangelog.safeParse(req.body).success){
            return res.error(messages.INVALID_DATA);
        }
        let changelogSchema = createChangelog.parse(req.body);
        const app : Changelog = {
            title: changelogSchema.title,
            description: changelogSchema.description,
            createdAt: new Date().getTime(),
            author: req.user.id,
            content: changelogSchema.content,
            type: changelogSchema.type,
        }
        await db.insertChangelog(app);
        emitAll('createChangelog', app);
        f.sendPushToTopic('changelog', "📣 Nowy wpis w dzienniku zmian", `${req.user.username} dodał nowy wpis z tytułem ${changelogSchema.title}`);
        return res.success(app)
    } catch(err) {
        return res.error(err);
    }
}
