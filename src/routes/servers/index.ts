import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import createServer from './createServer';
import getServer from './getServer';
import joinServer from './joinServer';
const router = express.Router();

router.use('/:id', rateLimits(20, 100));
router.route("/:id").get(checkAuth, getServer);
router.use('/:id/join', rateLimits(180, 30));
router.route("/:id/join").post(checkAuth, joinServer);

router.use('/', rateLimits(180, 5));
router.route("/").post(checkAuth, createServer);

module.exports = router;