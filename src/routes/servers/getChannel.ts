import express from 'express';
import db from "../../db";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.params.channel) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!req.user.servers.includes(req.params.id)) return res.notFound();

        let server = await db.getServer(req.params.id);
        if(!server) {
            return res.notFound();
        } else {
            let channel = server.channels.find(a=>a.id === req.params.channel);
            console.log(channel);
            if(!channel){
                return res.notFound();
            }
            return res.success(channel);
        }
    } catch(err) {
        return res.error(err);
    }
}
