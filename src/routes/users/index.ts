import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import checkPerm from '../../middlewares/checkPerm';
import rateLimits from '../../middlewares/rateLimits';
import getUser from './getUser';
import getServers from './getServers';
import editBadges from "./editBadges";
import editUser from "./editUser";
import getFriends from "./getFriends";
import getFriendRequests from "./getFriendRequests";
import deleteUser from "./deleteUser";
const router = express.Router();

router.use('/:id', rateLimits(20, 100));
router.route("/:id").get(checkAuth, getUser).delete(checkAuth, deleteUser);

router.use('/:id/friends', rateLimits(20, 100));
router.route("/:id/friends").get(checkAuth, getFriends);

router.use('/:id/friends/pending', rateLimits(20, 100));
router.route("/:id/friends/pending").get(checkAuth, getFriendRequests);

router.use('/:id/friends/:userId', rateLimits(20, 100));
router.route("/:id/friends/:userId").get(checkAuth, getFriendRequests);

router.use('/:id/servers', rateLimits(20, 100));
router.route("/:id/servers").get(checkAuth, getServers);

router.use('/:id/badges', rateLimits(60, 50));
router.route("/:id/badges").post(checkAuth, checkPerm(3), editBadges);

router.use('/:id/edit', rateLimits(10*60, 5));
router.route("/:id/edit").put(checkAuth, editUser);

module.exports = router;
