import express from 'express';
import { messages } from '../models/responseMessages';

export default function rateLimits(seconds: number, maxRequests: number) {
    const cache: {[id: string]: {lastRequest: Date, requestCount: number}} = {};

    return async function(req: express.Request, res: express.Response, next: express.NextFunction) {
        const user = req.user;
        if(!user) return next();
        const c = cache[user.id+req.path];
        if(!c) {
            cache[user.id+req.path] = {lastRequest: new Date(), requestCount: 1};
            return next();
        }

        if(c.requestCount >= maxRequests) {
            const end = new Date(c.lastRequest.getTime());
            end.setSeconds(end.getSeconds() + seconds);
            if (new Date() < end) {
                res.status(419).json({message: messages.RATELIMIT});
            } else {
                c.requestCount = 0;
                c.lastRequest = new Date();
                next();
            }
        } else {
            c.lastRequest = new Date();
            c.requestCount++;
            next();
        }
    }
}