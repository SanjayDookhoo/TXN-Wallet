import express from 'express';
const router = express.Router();

import { signIn, signUp } from '../controllers/user.js';

router.post('/sign_in', signIn);
router.post('/sign_up', signUp);

export default router;
