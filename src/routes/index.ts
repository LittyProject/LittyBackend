import express from 'express';
const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./users"));
router.use("/servers", require("./servers"));

/*
router.use("", require(""));
router.use("", require(""));
*/

router.use("*", async(req: express.Request, res: express.Response) => {
    res.notFound();
});

module.exports = router;