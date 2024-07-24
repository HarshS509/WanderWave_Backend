import { Post } from '../models/post.model.js';




export const isAuthorMiddleware = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'The requested post was not found.' });
    }

    if (post.authorId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to perform this action.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
