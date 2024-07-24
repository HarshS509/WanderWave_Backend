import { JWT_SECRET } from '../constants.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
export const authMiddleware = async (req, res, next) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return next(new ApiError(400, 'Please log in again to continue.'));
  }

  if (token) {
    jwt.verify(token, JWT_SECRET, (error, payload) => {
      if (error) {
        return new ApiError(403, 'The token is invalid or has expired.');
      }
      req.user = payload;
      next();
    });
  }
};

export const isAdminMiddleware = async (req, res, next) => {
  const role = req.user.role;
  if (role !== 'ADMIN') {
    return new ApiError(401, 'Access denied. You are not authorized to perform this action.');
  }
  next();
};
