
import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import rateLimits from '../../middlewares/rateLimits';
import checkPerm from "../../middlewares/checkPerm";

import sendStaffMessage from "./sendStaffMessage";
import getUserStaffMessages from "./getUserStaffMessages";
import getUserSendedStaffMessage from "./getUserSendedStaffMessage";
import createAccessCode from './createAccessCode';
import getAccessCodes from './getAccessCodes';
import deleteCode from './deleteCode';

const router = express.Router();

router.use('/staffmessage', rateLimits(20, 100));
router.route("/staffmessage").get(checkAuth,checkPerm('STAFF'), getUserStaffMessages).post(checkAuth,checkPerm('DEVELOPER'), getUserSendedStaffMessage);

router.use('/staffmessage/user/:id', rateLimits(20, 100));
router.route("/staffmessage/user/:id").post(checkAuth,checkPerm('DEVELOPER'), sendStaffMessage);

router.use('/access', rateLimits(20, 5))
router.route('/access').post(checkAuth,checkPerm('DEVELOPER'),createAccessCode).get(checkAuth, checkPerm('DEVELOPER'), getAccessCodes);



router.use('/access/:code', rateLimits(20, 5))
router.route('/access/:code').delete(checkAuth, checkPerm('DEVELOPER'), deleteCode);
module.exports = router;