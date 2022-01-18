import db from '../db';
import express from 'express';
import ipRangeCheck from "ip-range-check";
import crypto from "crypto";
import {User, userSchema} from '../models/user';
import "../../custom";

const cloudFlareIps = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/12",
    "172.64.0.0/13",
    "131.0.72.0/22"
];

export default async function(req: express.Request, res: express.Response, next: express.NextFunction) {
    let token = req.headers['authorization'];

    if(!token) {
	    return res.notAuthorized();
    }

    if(token.toUpperCase().includes("BEARER ")){
        token = token.split(' ')[1];
    }
    const user : User | null = await db.getUserByToken(token);
    if(!user) {
        return res.notAuthorized();
    } else {
        if(user.banned) return res.banned();
        const userIP = (req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.connection.remoteAddress)?.toString();
        if(userIP) {
            let lastIP = crypto.createHash('sha256').update(userIP).digest('hex')
            if (user.lastIP != lastIP) {
                user.lastIP = lastIP;
                await db.updateUser(user);
            }

            // const address = req.connection.remoteAddress;
            // console.log(address);
            // if (!address || ipRangeCheck(address, cloudFlareIps)) {
            //     res.banned();
            // } else {
            //     if(await db.isIPBanned(user.lastIP)) return res.banned();
            //     req.user = user;
            //     next();
            // }
            //if(await db.isIPBanned(user.lastIP)) return res.banned();
            req.user = user;
            next();
        }



    }

    /*if(!hasPerm(user.perm, perm)) {
        res.error('unauthorized');
        return;
    }*/
}

