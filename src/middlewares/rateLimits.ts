import express from 'express';

async function render(req: express.Request, res: express.Response, path: string, title: string, data: any = {}){
    const universal = {user: req.user, server: null, channel: null, title: title};
    res.render(path, Object.assign(universal, data));
}

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
                await render(req, res, "errors/ratelimited", "error", {});
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