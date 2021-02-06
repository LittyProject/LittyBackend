import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import checkPerm from '../../middlewares/checkPerm';
import rateLimits from '../../middlewares/rateLimits';
import getUser from './getUser';
import editBadges from "./editBadges";
import editUser from "./editUser";
const router = express.Router();

router.use('/:id', rateLimits(20, 100));
router.route("/:id").get(checkAuth, getUser);

router.use('/:id/badges', rateLimits(60, 50));
router.route("/:id/badges").post(checkAuth, checkPerm(3), editBadges);

router.use('/:id/edit', rateLimits(10*60, 5));
router.route("/:id/edit").put(checkAuth, editUser);

module.exports = router;
