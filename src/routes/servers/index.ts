import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import createServer from './createServer';
import getServer from './getServer';
import joinServer from './joinServer';
const router = express.Router();

router.route("/:id").get(checkAuth, getServer);
router.route("/:id/join").post(checkAuth, joinServer);

router.route("/").post(checkAuth, createServer);

module.exports = router;