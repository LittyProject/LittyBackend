import express, {response} from 'express';
import bodyParser from 'body-parser';
import { messages } from './models/responseMessages';
import cors from 'cors';


const methodOverride = require("method-override");
const app = express();

// SOCKET.IO SECTION
const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const io = socketIO(server);
require("./io")(io);

// EXPRESS SECTION


const corsWhitelist = [
    'http://localhost:1920', 'http://localhost:8080'
];

app.use(cors({
    origin: (origin, callback) => {
        if(!origin) callback(null, true);
        else if(!corsWhitelist.includes(origin)) callback(new Error('cors origin not allowed: ' + origin), false);
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
app.use(bodyParser.json())

app.use("/api/", require("./routes/index"));
app.use("/", require("./routes/index"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('Litty is running on port: '+PORT);
});

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

response.error = function(message) {
    this.status(403).json({message});
}

response.authError = function(err) {
    this.json({error: err});
}
