import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { FRONTEND_URL } from '../src/constants.js';
import compression from 'compression';
import { ApiResponse } from '../src/utils/ApiResponse.js';
import authRouter from '../src/routes/auth.route.js';
import userRouter from '../src/routes/user.route.js';
import postsRouter from '../src/routes/post.route.js';
import errorMiddleware from '../src/middlewares/error.middleware.js';

export const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, origin); // Allow the origin
      } else {
        callback(new Error('Not allowed by CORS')); // Block the origin
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(
  express.urlencoded({
    extended: true,
    limit: '5mb',
  })
);
app.use(compression());
app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
  res.send('Yay!! Backend of WanderWave app is now accessible');
});

app.all('*', (req, res) => {
  res
    .status(404)
    .json(new ApiResponse(404, {}, "Oops! The page you're looking for could not be found."));
});
app.use(errorMiddleware);
