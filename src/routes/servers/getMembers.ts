import express from 'express';
import db from "../../db";

// Example:
// -> With statuses
// GET /api/servers/:id/members?withStatuses=true
//
// -> Without statuses
// GET /api/servers/:id/members?withoutStatuses=true
//
// -> Sample data
// GET /api/servers/:id/members

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();

        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            if(req.query.withStatuses){
                return res.success(await db.getServerMembersWithStatuses(req.params.id));
            } else if(req.query.withoutStatuses) {
                return res.success(await db.getServerMembersWithoutStatuses(req.params.id));
            } else {
                return res.success(await db.getServerMembers(req.params.id));
            }
        }
    } catch(err) {
        return res.error(err);
    }
}
