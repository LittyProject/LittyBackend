import express from 'express';
import db from "../../db";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.params.role) return res.notFound();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();

        let server = await db.getServer(req.params.id);
        if(server) {
            let role = server.roles.find(a=>a.id === req.params.role);
            if(!role){
                return res.notFound();
            }
            return res.success(role);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
