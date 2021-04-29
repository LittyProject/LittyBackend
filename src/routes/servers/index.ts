import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import createServer from './createServer';
import getServer from './getServer';
import getExploreServer from './getExploreServers';
import getChannels from './getChannels';
import getChannel from './getChannel';
import getRoles from './getRoles';
import getMessages from "./getMessages";
import getMembers from "./getMembers";
import getRole from "./getRole";
import deleteRole from "./deleteRole";
import joinServer from './joinServer';
import leaveServer from './leaveServer';
import createMessage from "./createMessage";
import createChannel from "./createChannel";
import createInvite from "./createInvite";
import createRole from "./createRole";
import editFlags from "./editFlags";
import checkPerm from "../../middlewares/checkPerm";

//Update
import updateChannel from "./updateChannel";
import updateServer from "./updateServer";
import updateRole from "./updateRole";

//Delete
import deleteServer from "./deleteServer";
import deleteChannel from "./deleteChannel";

const router = express.Router();

router.use('/:id', rateLimits(20, 100));
router.route("/:id").get(checkAuth, getServer).put(checkAuth, updateServer).delete(checkAuth, deleteServer);

router.use('/:id/channels', rateLimits(20, 100));
router.route("/:id/channels").get(checkAuth, getChannels).post(checkAuth, createChannel);

router.use('/:id/invites', rateLimits(20, 100));
router.route("/:id/invites").post(checkAuth, createInvite);

router.use('/:id/channels/:channel', rateLimits(20, 100));
router.route("/:id/channels/:channel").get(checkAuth, getChannel).put(checkAuth, updateChannel).delete(checkAuth, deleteChannel);

router.use('/:id/roles', rateLimits(20, 100));
router.route("/:id/roles").get(checkAuth, getRoles).post(checkAuth, createRole);

router.use('/:id/roles/:role', rateLimits(20, 100));
router.route("/:id/roles/:role").get(checkAuth, getRole).put(checkAuth, updateRole).delete(checkAuth, deleteRole);

router.use('/:id/channels/:channel/messages', rateLimits(20, 100));
router.route("/:id/channels/:channel/messages").get(checkAuth, getMessages).post(checkAuth, createMessage);

router.use('/:id/flags', rateLimits(60, 50));
router.route("/:id/flags").post(checkAuth, checkPerm('OWNER'), editFlags);

router.use('/:id/members', rateLimits(20, 90));
router.route("/:id/members").get(checkAuth, getMembers);

router.use('/:id/join', rateLimits(180, 30));
router.route("/:id/join").post(checkAuth, joinServer);
router.use('/:id/leave', rateLimits(180, 30));
router.route("/:id/leave").post(checkAuth, leaveServer);

router.use('/', rateLimits(180, 5));
router.route("/").post(checkAuth, createServer).get(checkAuth, getExploreServer);

module.exports = router;