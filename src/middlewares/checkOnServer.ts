import db from "../db";
import { User } from "../models/user";

export default async function(user: User | undefined, serverID: string) {
    if(!user) return false;
    if(await db.isUserInServer(user.id, serverID)) return true;
    return false;
}
