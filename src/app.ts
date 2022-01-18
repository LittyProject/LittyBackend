import express, {response} from 'express';
import bodyParser from 'body-parser';
import { messages } from './models/responseMessages';
import cors from 'cors';
import db from "./db";
const methodOverride = require("method-override");
const app = express();
import fileUpload = require('express-fileupload');
import {instrument} from "@socket.io/admin-ui";
db.conn();

const config = require('../config.json');
import admin from 'firebase-admin';

var serviceAccount = require("../firebase.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://litty-b7a77-default-rtdb.firebaseio.com"
});
  

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) callback(null, true);
        else if(!config.cors.includes(origin)) callback(new Error('cors origin not allowed: ' + origin), false);
        else callback(null, true);
    }
}));
app.use((req, res, next)=>{
    console.log(`[${req.method}] ${req.path}`);
    next();
});
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(bodyParser.json());

app.use(`/cdn/${config.cdn.user.avatar.path}`, express.static(`${__dirname}/cdn/${config.cdn.user.avatar.path}`));
app.use(`/cdn/${config.cdn.server.icon.path}`, express.static(`${__dirname}/cdn/${config.cdn.server.icon.path}`));
app.use(`/cdn/${config.cdn.server.banner.path}`, express.static(`${__dirname}/cdn/${config.cdn.server.banner.path}`));
app.use(fileUpload());

app.use("/api/", require("./routes/index"));
app.use("/", require("./routes/index"));

const PORT = process.env.PORT || 1920;
const s = app.listen(PORT, async () => {
    //console.log(new Date().getTime())
    console.log('Litty is running on port: '+PORT);
});

const socketIO = require("socket.io");
const io = socketIO({
    perMessageDeflate: false,
    pingTimeout: 60000,
    transports: ["websocket", "polling"],
    path: "/gateway",
    cors: {
        origin: '*',
        credentials: true
    }
}).listen(s);
require("./io")(io);
instrument(io, {
    auth: false,
});


// OTHER
response.success = function(data) {
    if(data) this.json({...messages.SUCCESS, data});
    else this.json({...messages.SUCCESS});
}

response.notFound = function() {
    this.status(404).json({...messages.NOT_FOUND});
}

response.notAuthorized = function() {
    this.status(401).json({...messages.UNAUTHORIZED});
}

response.banned = function() {
    this.status(401).json({...messages.BANNED});
}

response.error = function(message) {
    this.status(200).json({...message});
}

response.authError = function(err) {
    this.json({error: err});
}

export const SocketServer = io;
export const FirebaseAdmin = firebase;
