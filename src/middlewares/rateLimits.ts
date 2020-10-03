import express from 'express';

export default function rateLimits(seconds: number, maxRequests: number) {
    const cache: {[id: string]: {lastRequest: Date, requestCount: number}} = {};

    return async function(req: express.Request, res: express.Response, next: express.NextFunction) {
        const user = req.user;
        if(!user) return next();
        const c = cache[user.id];
        if(!c) {
            cache[user.id] = {lastRequest: new Date(), requestCount: 1};
            return next();
        }

        if(c.requestCount >= maxRequests) {
            const end = new Date(c.lastRequest.getTime());
            end.setSeconds(end.getSeconds() + seconds);
            if (new Date() < end) {
                res.status(419).json({message: "ratelimited"});
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