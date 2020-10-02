import express, {response} from 'express';
import bodyParser from 'body-parser';
import db from './db';

const methodOverride = require("method-override");

const indexRoute = require("./routes");

const app = express();

const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const io = socketIO(server);
require("./io/index")(io);

app.use((req, res, next)=>{
    console.log(`[${req.method}] ${req.path}`);
    next();
});
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(bodyParser.json())
app.use("/", express.static('public'))
app.set("view engine", "ejs")

app.use("/", require("./routes/index"));  

response.success = function(data) {
    if(data)
        this.json({data});
    else this.json({message: "success"});
}

response.error = function(message) {
    this.status(403).json({message});
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log('Running on port '+PORT);
});