import express from 'express';
const router = express.Router();

router.use("/auth", require("./auth"));

/*
router.use("", require(""));
router.use("", require(""));
router.use("", require(""));
router.use("", require(""));
*/

router.use("*", async(req: express.Request, res: express.Response) => {
    res.notFound();
});

module.exports = router;