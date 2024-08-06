import { REDIS_KEYS, validCategories } from '../constants.js';
import { Post } from '../models/post.model.js';
import User from '../models/user.model.js';
import { deleteDataFromCache, storeDataInCache } from '../utils/cachedPosts.js';
export const createPostHandler = async (req, res) => {
  try {
    const {
      title,
      authorName,
      imageLink,
      categories,
      description,
      isFeaturedPost = false,
    } = req.body;
    console.log(req.body, 'and user is ', req.user._id);
    const userId = req.user._id;

    // Validation - check if all fields are filled
    if (!title || !authorName || !imageLink || !description || !categories) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validation - check if imageLink is a valid URL
    const imageLinkRegex = /\.(jpg|jpeg|png|webp)$/i;
    if (!imageLinkRegex.test(imageLink)) {
      return res
        .status(400)
        .json({ message: 'Image URL must end with .jpg, .jpeg, .webp, or .png' });
    }

    // Validation - check if categories array has more than 3 items
    if (categories.length > 3) {
      return res.status(400).json({ message: 'Please select up to three categories only' });
    }

    const post = new Post({
      title,
      authorName,
      imageLink,
      description,
      categories,
      isFeaturedPost,
      authorId: req.user._id,
    });

    const [savedPost] = await Promise.all([
      post.save(), // Save the post
      deleteDataFromCache(REDIS_KEYS.ALL_POSTS), // Invalidate cache for all posts
      deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS), // Invalidate cache for featured posts
      deleteDataFromCache(REDIS_KEYS.LATEST_POSTS), // Invalidate cache for latest posts
    ]);

    // updating user doc to include the ObjectId of the created post
    await User.findByIdAndUpdate(userId, { $push: { posts: savedPost._id } });

    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getAllPostsHandler = async (req, res) => {
  try {
    const posts = await Post.find();
    await storeDataInCache(REDIS_KEYS.ALL_POSTS, posts);
    return res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getFeaturedPostsHandler = async (req, res) => {
  try {
    const featuredPosts = await Post.find({ isFeaturedPost: true });
    await storeDataInCache(REDIS_KEYS.FEATURED_POSTS, featuredPosts);
    res.status(200).json(featuredPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getPostByCategoryHandler = async (req, res) => {
  const category = req.params.category;
  try {
    // Validation - check if category is valid
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category!' });
    }

    const categoryPosts = await Post.find({ categories: category });
    res.status(200).json(categoryPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getLatestPostsHandler = async (req, res) => {
  try {
    const latestPosts = await Post.find().sort({ timeOfPost: -1 });
    await storeDataInCache(REDIS_KEYS.LATEST_POSTS, latestPosts);
    res.status(200).json(latestPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getPostByIdHandler = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Validation - check if post exists
    if (!post) {
      return res.status(404).json({ message: 'The requested post was not found.' });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updatePostHandler = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // Validation - check if post exists
    if (!updatedPost) {
      return res.status(404).json({ message: 'The requested post was not found.' });
    }
    // invalidate the redis cache
    await deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
      await deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
      await deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
      await res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const deletePostByIdHandler = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    // Validation - check if post exists
    if (!post) {
      return res.status(404).json({ message: 'The requested post was not found.' });
    }
    await User.findByIdAndUpdate(post.authorId, { $pull: { posts: req.params.id } });

    // invalidate the redis cache
    await deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
      await deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
      await deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
      res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getRelatedPostsByCategories = async (req, res) => {
  const { categories } = req.query;
  // const categoriesArray = categories.split(',');

  if (!categories) {
    return res.status(404).json({ message: 'Categories not found' });
  }
  try {
    const filteredCategoryPosts = await Post.find({
      categories: { $in: categories },
    });
    res.status(200).json(filteredCategoryPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
