import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import getInvite from "./getInvite";
const router = express.Router();


router.use('/:id', rateLimits(20, 100));
router.route("/:id").get(getInvite);

module.exports = router;