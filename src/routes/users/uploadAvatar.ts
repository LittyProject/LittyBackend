import express from 'express';
const config = require('../../../config.json');
const fs = require('fs');
let path = require("path");
import { userUpdate, User } from "../../models/user";
import db from "../../db";
import * as f from "../../functions";
import { messages } from '../../models/responseMessages';
import {SocketServer} from "../../app";
import {emit} from "../../functions";

export default async function(req: express.Request, res: express.Response) {
    try {
        if(!req.user) return res.notAuthorized;
        let user = await db.getUser(req.params.id == "@me" ? req.user.id : req.params.id);
        if(user) {
            if(req.user.id !==user?.id){
                return res.error('This user id is not yours');
            }
            let files = req.files;
            if (!files || Object.keys(files).length === 0){
                return res.error('No files were uploaded.');
            }
            let avatar = req.files?.avatar;
            if(!avatar){
                return res.error('No files were uploaded.');
            }
            let extension = avatar.name.substring(avatar.name.lastIndexOf('.') + 1);
            if(!config.cdn.imageExtensions.includes(extension)){
                return res.error('Invalid avatar extension');
            }
            let size = f.formatSize(avatar.size);
            if(!['bytes', 'KB', 'MB'].includes(size.type)){
                return res.error(`Invalid avatar size : ${size.size} ${size.type}`);
            }
            if(size.type==='MB'&&size.size>10){
                return res.error(`Invalid avatar size : ${size.size} ${size.type} > 10 MB`);
            }
            const pt = path.join(__dirname, '..', '..', `/cdn/${config.cdn.user.avatar.path}/${user.id}.${extension}`);
            avatar.mv(pt, async function (err: any) {
                if (err){
                    console.log(err);
                    return res.error('Invalid avatar upload');
                }
                for(let server of user.servers){
                    emit(server, 'serverMemberUpdate', {server: server, member: user.id, data: {avatarURL: `${user.id}.${extension}`}});
                }
                emit(user.id, 'userUpdate', {avatarURL: `${user.id}.${extension}`});
                await db.updateUser({id: user.id, avatarURL: `${user.id}.${extension}`});
                res.success("Success");
            })
        }
    } catch(err) {
        console.log(err);
        return res.error(err);
    }
}
