import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import getApplications from "./getApplications";
import createApplication from "./createApplication";
import deleteApplications from "./deleteApplications";
import editApplications from "./editApplications";
const router = express.Router();


router.use('/', rateLimits(20, 20));
router.route("/").get(checkAuth, getApplications).post(checkAuth, createApplication);
router.use('/:id', rateLimits(20, 100));
router.route("/:id").delete(checkAuth, deleteApplications).put(checkAuth, editApplications);

module.exports = router;
