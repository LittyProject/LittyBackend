import bcrypt from 'bcrypt';
import { number } from 'zod';
let uniqid = require('uniqid');

export function genID(): string{
    return uniqid();
}

export async function compareHash(string: string, password: string): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
        bcrypt.compare(string, password, async function(err, result) {
            if(err) rej(err);
            else res(result);
        });
    });
}

export async function hashPassword(string: string): Promise<string> {
    return new Promise<string>((res, rej) => {
        bcrypt.genSalt(10, async function(err, salt) {
            bcrypt.hash(string, salt, async function(err, hash) {
                if(err) rej(err);
                else res(hash);
            });
        });
    })
}

export function createID(length: number) {
    let result  = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function createTag() {
    let result  = '';
    let characters = '0123456789ABCDEF';
    let charactersLength = characters.length;
    for (let i = 0; i < 4; i++) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// await f.getOnly(user, "id avatarURL bot");
export async function getOnly(model: any, whatToGet: string){
    if(whatToGet == "" || model == {}) return {};
    let keys = await whatToGet.split(" ");
    let toReturn: any = {};
    for(let num in keys){
        toReturn[keys[num]] = model[keys[num]];
    }
    return await toReturn;
}