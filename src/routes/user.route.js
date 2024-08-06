import { Router } from 'express';
import { authMiddleware, isAdminMiddleware } from '../middlewares/auth.middleware.js';
import {
  changeUserRoleHandler,
  deleteUserHandler,
  getAllUserHandler,
} from '../controllers/user.controller.js';

const router = Router();

// router.route('/').get(authMiddleware, isAdminMiddleware, getAllUserHandler);
router.route('/').get(authMiddleware, isAdminMiddleware, getAllUserHandler);

router
  .route('/:userId')
  .patch(authMiddleware, isAdminMiddleware, changeUserRoleHandler)
  .delete(authMiddleware, isAdminMiddleware, deleteUserHandler);

export default router;
