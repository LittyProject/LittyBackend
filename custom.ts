import {User} from './src/models/user';
import { response } from "express";

declare module 'express-serve-static-core' {

    interface Request {
        user: User;
        rawBody?: any;
    }
    interface Response {
        success(data?: any): void;
        error(data: any): void;
        notFound(): void;
        notAuthorized(): void;
        banned(): void;
        forbidden(): void;
        authError(data: any): void;
    }
}
