import express from 'express';
const router = express.Router();

import login from './login';
import register from './register';

router.route("/login").post(login);
router.route("/register").post(register);

module.exports = router;