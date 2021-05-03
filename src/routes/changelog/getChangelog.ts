import express from 'express';
import db from "../../db";

export default async function(req: express.Request, res: express.Response) {
    try {
        let changelogs = await db.getChangelogs();
        let a = changelogs.sort((a: any, b: any)=> b.createdAt-a.createdAt);
        await Promise.all(a.map(async (b) => {
                let user = await db.getUser(b.author);
                // @ts-ignore
                b.author = {username: user.username, flags: user.flags, tag: user.tag};
            })
        );
        return res.success(a);
    } catch(err) {
        return res.error(err);
    }
}
