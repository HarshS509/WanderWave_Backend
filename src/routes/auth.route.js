import { Router } from 'express';
import { isLoggedIn, logInUser, logOutUser, registerUser } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(registerUser);

router.route('/login').post(logInUser);

router.route('/logout').post(logOutUser);
router.route('/check/:_id').get(isLoggedIn);
export default router;
