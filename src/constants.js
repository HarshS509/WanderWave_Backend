import 'dotenv/config';
export const DB_NAME = 'wanderwave';
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN;
export const JWT_SECRET = process.env.JWT_SECRET;
export const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN;
export const ACCESS_COOKIE_MAXAGE = process.env.ACCESS_COOKIE_MAXAGE;
export const NODE_ENV = process.env.NODE_ENV;
export const cookieOptions = {
  httpOnly: true,
  sameSite: NODE_ENV === 'Development' ? 'lax' : 'none',
  secure: NODE_ENV === 'Development' ? false : true,
  maxAge: ACCESS_COOKIE_MAXAGE,
};

export const validCategories = [
  'Travel',
  'Nature',
  'City',
  'Adventure',
  'Beaches',
  'Landmarks',
  'Mountains',
];
