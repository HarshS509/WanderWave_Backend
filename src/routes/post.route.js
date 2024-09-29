import { Router } from 'express';
import {
  createPostHandler,
  deletePostByIdHandler,
  getAllPostsHandler,
  getFeaturedPostsHandler,
  getLatestPostsHandler,
  getPostByCategoryHandler,
  getPostByIdHandler,
  getRelatedPostsByCategories,
  updatePostHandler,
} from '../controllers/posts.controller.js';
import { cacheHandler } from '../utils/middleware.js';
import { isAdminMiddleware, authMiddleware } from '../middlewares/auth.middleware.js';
import { isAuthorMiddleware } from '../middlewares/post.middleware.js';
const router = Router();

// Create a new post
router.post('/', authMiddleware, createPostHandler);

// Get all posts
router.get('/', getAllPostsHandler);

// Route to get featured posts
router.get('/featured', getFeaturedPostsHandler);

// Route to get related category posts
router.get('/related-posts-by-category', getRelatedPostsByCategories);

// Route to get posts by category
router.get('/categories/:category', getPostByCategoryHandler);

// Route for fetching the latest posts
router.get('/latest', getLatestPostsHandler);
// Get a specific post by ID
router.get('/:id', getPostByIdHandler);

// Update a post by ID
router.patch('/:id', authMiddleware, isAuthorMiddleware, updatePostHandler);

// Delete a post by ID
router.delete('/:id', authMiddleware, isAuthorMiddleware, deletePostByIdHandler);

// Update a post by admin with ID
router.patch('/admin/:id', authMiddleware, isAdminMiddleware, updatePostHandler);

// Delete a post by admin with ID
router.delete('/admin/:id', authMiddleware, isAdminMiddleware, deletePostByIdHandler);

export default router;
