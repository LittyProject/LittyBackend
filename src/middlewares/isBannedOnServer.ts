import express from "express";
import db from "../db";
import { User } from "../models/user";

export default async function(user: User | undefined, serverID: string) {
    if(!user) return false;
    let server = await db.getServer(serverID);
    if(server?.banList.filter(x => x.id == user.id) !== []) return true;
    return false;
}