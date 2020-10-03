import express from 'express';
const router = express.Router();

router.use("/", async(req: express.Request, res: express.Response) => {
    res.notFound();
});

//router.use("/users", require("./users"));

router.use("*", async(req: express.Request, res: express.Response) => {
    res.notFound();
});

/*
router.use("", require(""));
router.use("", require(""));
router.use("", require(""));
router.use("", require(""));
*/

module.exports = router;