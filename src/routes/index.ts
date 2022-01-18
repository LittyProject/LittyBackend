import express from 'express';
import {defaultPerms} from "../models/permission";
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/servers", require("./servers"));
router.use("/invite", require("./invite"));
router.use("/applications", require("./application"));
router.use("/changelog", require("./changelog"));
router.use("/admin", require("./admin"));

/*
router.use("", require(""));
router.use("", require(""));
*/

router.get("/data/perms", async(req: express.Request, res: express.Response) => {
    res.send(defaultPerms());
});

router.use("*", async(req: express.Request, res: express.Response) => {
    res.notFound();
});

module.exports = router;
