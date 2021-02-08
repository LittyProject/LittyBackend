import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import getApplications from "./getApplications";
const router = express.Router();


router.use('/', rateLimits(20, 100));
router.route("/").get(checkAuth, getApplications);

module.exports = router;
