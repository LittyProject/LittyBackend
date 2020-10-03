import express from "express";
import { User } from "../models/user";

export default function(user: User | undefined, serverID: string) {
    if(!user) return false;
    if(user.servers.includes(serverID)) return true;
    return false;
}