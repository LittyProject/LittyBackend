import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import getApplications from "./getApplications";
import createApplication from "./createApplication";
const router = express.Router();


router.use('/', rateLimits(20, 100));
router.route("/").get(checkAuth, getApplications).post(checkAuth, createApplication);

module.exports = router;
