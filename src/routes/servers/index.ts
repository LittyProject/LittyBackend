import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import createServer from './createServer';
import getServer from './getServer';
import getChannels from './getChannels';
import getChannel from './getChannel';
import joinServer from './joinServer';
import leaveServer from './leaveServer';
const router = express.Router();

router.use('/:id', rateLimits(20, 100));
router.route("/:id").get(checkAuth, getServer);
router.use('/:id/channels', rateLimits(20, 100));
router.route("/:id/channels").get(checkAuth, getChannels);
router.use('/:id/channels/:channel', rateLimits(20, 100));
router.route("/:id/channels/:channel").get(checkAuth, getChannel);
router.use('/:id/join', rateLimits(180, 30));
router.route("/:id/join").post(checkAuth, joinServer);
router.use('/:id/leave', rateLimits(180, 30));
router.route("/:id/leave").post(checkAuth, leaveServer);

router.use('/', rateLimits(180, 5));
router.route("/").post(checkAuth, createServer);

module.exports = router;