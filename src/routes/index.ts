import express from 'express';
import {SocketServer} from "../app";
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/servers", require("./servers"));
router.use("/invite", require("./invite"));
router.use("/applications", require("./application"));
router.use("/changelog", require("./changelog"));

/*
router.use("", require(""));
router.use("", require(""));
*/

// router.use("/connect", async(req: express.Request, res: express.Response) => {
//     SocketServer.sockets.sockets.forEach((socket : any)=>{
//         if(socket.id==="a"){
//
//         }
//     });
//     res.send(SocketServer.sockets.clientsCount);
// });

router.use("*", async(req: express.Request, res: express.Response) => {
    res.notFound();
});

module.exports = router;