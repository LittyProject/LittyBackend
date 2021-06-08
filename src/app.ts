import express, {response} from 'express';
import bodyParser from 'body-parser';
import { messages } from './models/responseMessages';
import cors from 'cors';
import db from "./db";
const methodOverride = require("method-override");
const app = express();
import fileUpload = require('express-fileupload');
db.conn();

const config = require('../config.json');

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
    console.log(new Date().getTime())
    console.log('Litty is running on port: '+PORT);
});

// SOCKET.IO SECTION
const http = require("http");
const socketIO = require("socket.io");
const io = socketIO({
    perMessageDeflate: false,
    pingTimeout: 60000,
    transports: ["websocket", "polling"],
    path: "/gateway",
}).listen(s);


require("./io")(io);

// OTHER
response.success = function(data) {
    if(data) this.json(data);
    else this.json({message: messages.SUCCESS});
}

response.notFound = function() {
    this.status(404).json({message: messages.NOT_FOUND});
}

response.notAuthorized = function() {
    this.status(401).json({message: messages.UNAUTHORIZED});
}

response.banned = function() {
    this.status(401).json({message: messages.BANNED});
}

response.forbridden = function() {
    this.status(403).json({message: messages.FORBRIDDEN});
}


response.error = function(message) {
    this.status(403).json({message});
}

response.authError = function(err) {
    this.json({error: err});
}

export const SocketServer = io;
