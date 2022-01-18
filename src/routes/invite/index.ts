import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import getInvite from "./getInvite";
import joinServer from "./joinServer";
const router = express.Router();


router.use('/:code', rateLimits(20, 100));
router.route("/:code").get(getInvite).post(checkAuth, joinServer);

module.exports = router;