import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import checkPerm from "../../middlewares/checkPerm";
import createChangelog from "./createChangelog";
import getChangelog from "./getChangelog";


const router = express.Router();


router.use('/', rateLimits(20, 100));
router.route("/").get(getChangelog).post(checkAuth,checkPerm('DEVELOPER'), createChangelog);

module.exports = router;