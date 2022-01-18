import express from 'express';
import db from "../../db";
import {ExportServer, Server} from "../../models/server";
import {ExportChannel} from "../../models/channel";

// Example:
// -> With all data
// GET /api/servers/:id?withMembers=true&withMembersStatus=true&withChannels=true&withMessages=true&withInvites=true&withRoles=true
//
// -> Only with invites
// GET /api/servers/:id?withInvites=true
//
// -> With channels and messages
// GET /api/servers/:id?withChannels=true&withMessages=true
//
// -> Get export server
// GET /api/servers/:id?withExport=true

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.params.id) return res.notFound();
        if(!req.user) return res.notAuthorized();
        if(!(await db.isUserInServer(req.user.id, req.params.id))) return res.notFound();

        if(req.query.withExport){
            let server : ExportServer | null = await db.getExportServer(req.params.id);
            if(!server){
                return res.notFound();
            }

            return res.success(server);
        }
        let server : Server | null = await db.getServer(req.params.id);
        if(server) {
            let exportServer : ExportServer = server;
            if(req.query.withMembers) {
                if(req.query.withMembersStatus){
                    exportServer.members = await db.getServerMembersWithStatuses(server.id);
                } else {
                    console.log("tutaj");
                    exportServer.members = await db.getServerMembers(server.id);
                }
            }
            if(req.query.withChannels) {
                exportServer.channels = await db.getServerChannels(server.id);
                if(req.query.withMessages && exportServer.channels.length > 0) {
                    const exportChannels: ExportChannel[] = [];
                    for (let channel of exportServer.channels) {
                        let ch: ExportChannel = channel;
                        ch.messages = await db.getMessages(server.id, ch.id, Date.now());
                        exportChannels.push(ch);
                    }
                    exportServer.channels = exportChannels;
                }
            }
            if(req.query.withInvites) exportServer.invites = await db.getServerInvites(server.id);
            if(req.query.withRoles) exportServer.roles = await db.getServerRoles(server.id);
            return res.success(server);
        }
        return res.notFound();
    } catch(err) {
        return res.error(err);
    }
}
