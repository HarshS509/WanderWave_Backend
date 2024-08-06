import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { cookieOptions, JWT_SECRET } from '../constants.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  if (!userName || !fullName || !email || !password) {
    throw new ApiError(400, 'Please provide all required fields');
  }
  const existingUser = await User.findOne({
    $or: [{ email }, { userName }],
  });
  if (existingUser) {
    if (existingUser.email === email) {
      throw new ApiError(400, 'Email already exists!');
    } else if (existingUser.userName === userName) {
      throw new ApiError(400, 'Username already exists!');
    }
  }
  const user = new User({
    userName,
    fullName,
    email,
    password,
  });

  try {
    await user.validate();
  } catch (error) {
    const validationErrors = [];
    for (const key in error.errors) {
      validationErrors.push(error.errors[key].message);
    }
    throw new ApiError(400, validationErrors.join(', '));
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;

  await user.save();
  user.password = undefined;
  res
    .status(200)
    .cookie('access_token', accessToken, cookieOptions)
    .cookie('refresh_token', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          user,
        },
        'New user profile created successfully.'
      )
    );
});
export const logInUser = asyncHandler(async (req, res) => {
  const { userNameOrEmail, password } = req.body;
  if (!userNameOrEmail || !password) {
    throw new ApiError(400, 'Please provide all required fields');
  }
  const user = await User.findOne({
    $or: [{ email: userNameOrEmail }, { userName: userNameOrEmail }],
  }).select('+password');
  if (!user) {
    throw new ApiError(400, 'User not found!');
  }
  const isCorrectPassword = await user.isPasswordCorrect(password);

  if (!isCorrectPassword) {
    throw new ApiError(401, 'The password provided is invalid!');
  }
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();
  user.password = undefined;
  res
    .status(200)
    .cookie('access_token', accessToken, cookieOptions)
    .cookie('refresh_token', refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
          user,
        },
        'User successfully logged in.'
      )
    );
});
export const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: '',
      },
    },
    {
      new: true,
    }
  );

  res
    .status(200)
    .clearCookie('access_token', cookieOptions)
    .clearCookie('refresh_token', cookieOptions)
    .json(new ApiResponse(200, {}, 'User successfully logged out.'));
});
export const isLoggedIn = asyncHandler(async (req, res) => {
  // console.log(req.cookies);
  let access_token = req.cookies?.access_token;
  let refresh_token = req.cookies?.refresh_token;
  // console.log(access_token, refresh_token);
  const { _id } = req.params;
  if (access_token) {
    try {
      jwt.verify(access_token, JWT_SECRET);
      return res
        .status(200)
        .json(new ApiResponse(200, access_token, 'Authentication token verified.'));
    } catch (error) {
      // Access token invalid, proceed to check refresh token
      console.log(error);
    }
  } else if (refresh_token) {
    try {
      jwt.verify(refresh_token, JWT_SECRET);
      access_token = await user.generateAccessToken();
      return res
        .status(HTTP_STATUS.OK)
        .cookie('access_token', access_token, cookieOptions)
        .json(new ApiResponse(200, access_token, 'Authentication token verified.'));
    } catch (error) {
      // Access token invalid, proceed to check refresh token that is in db
      console.log(error);
    }
  }
  const user = await User.findById(_id);
  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, 'User not found!'));
  }

  const { refreshToken } = user;

  if (!refreshToken) {
    return res.status(401).json(new ApiResponse(401, '', 'The token is invalid or has expired.'));
  }

  try {
    jwt.verify(refreshToken, JWT_SECRET);
    access_token = await user.generateAccessToken();
    refresh_token = await user.generateRefreshToken();

    user.refreshToken = refresh_token;
    await user.save();
    return res
      .status(200)
      .cookie('access_token', access_token, cookieOptions)
      .cookie('refresh_token', refresh_token, cookieOptions)
      .json(new ApiResponse(200, access_token, 'Authentication token verified.'));
  } catch (error) {
    return res
      .status(401)
      .json(new ApiResponse(401, error.message, 'The token is invalid or has expired.'));
  }
});
