import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import checkPerm from '../../middlewares/checkPerm';
import rateLimits from '../../middlewares/rateLimits';
import getUser from './getUser';
import getServers from './getServers';
import editUser from "./editUser";
import disableUser from "./disableUser";
import getFriends from "./getFriends";
import getFriendRequests from "./getFriendRequests";
import deleteUser from "./deleteUser";
import manageUser from "./manageUser";
const router = express.Router();

router.use('/:id', rateLimits(20, 100));
router.route("/:id").get(checkAuth, getUser).delete(checkAuth, deleteUser).put(checkAuth, editUser).post(checkAuth, disableUser).patch(checkAuth, checkPerm("DEVELOPER"), manageUser);

router.use('/:id/friends', rateLimits(20, 100));
router.route("/:id/friends").get(checkAuth, getFriends);

router.use('/:id/friends/pending', rateLimits(20, 100));
router.route("/:id/friends/pending").get(checkAuth, getFriendRequests);

router.use('/:id/friends/:userId', rateLimits(20, 100));
router.route("/:id/friends/:userId").get(checkAuth, getFriendRequests);

router.use('/:id/servers', rateLimits(20, 100));
router.route("/:id/servers").get(checkAuth, getServers);


module.exports = router;
