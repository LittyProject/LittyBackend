import express, {response} from 'express';
import bodyParser from 'body-parser';

const methodOverride = require("method-override");
const app = express();

// SOCKET.IO SECTION
const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const io = socketIO(server);
//require("./io")(io);

// EXPRESS SECTION
app.use((req, res, next)=>{
    console.log(`[${req.method}] ${req.path}`);
    next();
});
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(bodyParser.json())

app.use("/", require("./routes/index")); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('Litty is running on port: '+PORT);
});

// OTHER
response.success = function(data) {
    if(data) this.json({data});
    else this.json({message: "success"});
}

response.notFound = function() {
    this.status(404).json({message: "not found"});
}

response.notAuthorized = function() {
    this.status(401).json({message: "unauthorized"});
}

response.error = function(message) {
    this.status(403).json({message});
}