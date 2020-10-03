import express from 'express';
import checkAuth from '../../middlewares/checkAuth';
import getUser from './getUser';
const router = express.Router();

router.route("/:id").get(checkAuth, getUser);

module.exports = router;