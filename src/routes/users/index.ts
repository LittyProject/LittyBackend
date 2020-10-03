import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import getUser from './getUser';
const router = express.Router();

router.use('/:id', rateLimits(20, 100));
router.route("/:id").get(checkAuth, getUser);

module.exports = router;