import express from 'express';
import db from "../../db";


//Member roles
export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        const a = await db.isUserInServer(req.user.id, req.params.id);
        if(!a) return res.notFound();

        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            const memberRoles = await db.getMemberRoles(req.user.id, server.id);
            console.log(memberRoles);
            return res.success(memberRoles);
        }
    } catch(err) {
        return res.error(err);
    }
}
