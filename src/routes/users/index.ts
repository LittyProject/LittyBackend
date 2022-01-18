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
import rejectFriend from "./rejectFriend";
import approveFriend from "./approveFriend";
import addFriend from "./addFriend";
import friendRemove from "./friendRemove";
import uploadAvatar from "./uploadAvatar";
const router = express.Router();


router.use('/:id', rateLimits(20, 100));
router.route("/:id").get(checkAuth, getUser).delete(checkAuth, deleteUser).put(checkAuth, editUser).post(checkAuth, disableUser).patch(checkAuth, checkPerm("DEVELOPER"), manageUser);

router.use('/:id/friends', rateLimits(20, 100));
router.route("/:id/friends").get(checkAuth, getFriends);

router.use('/:id/avatar', rateLimits(60*10, 1));
router.route("/:id/avatar").post(checkAuth, uploadAvatar);

router.use('/:id/friends/pending', rateLimits(20, 100));
router.route("/:id/friends/pending").get(checkAuth, getFriendRequests);

router.use('/:id/reject', rateLimits(20, 100));
router.route("/:id/reject").post(checkAuth, rejectFriend);

router.use('/:id/request', rateLimits(20, 100));
router.route("/:id/request").post(checkAuth, addFriend);

router.use('/:id/remove', rateLimits(20, 100));
router.route("/:id/remove").post(checkAuth, friendRemove);


router.use('/:id/approve', rateLimits(20, 100));
router.route("/:id/approve").post(checkAuth, approveFriend);

router.use('/:id/friends/:userId', rateLimits(20, 100));
router.route("/:id/friends/:userId").get(checkAuth, getFriendRequests);

router.use('/:id/servers', rateLimits(20, 100));
router.route("/:id/servers").get(checkAuth, getServers);


module.exports = router;
