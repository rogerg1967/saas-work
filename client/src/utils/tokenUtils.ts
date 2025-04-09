import * as jwtDecode from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email?: string;
  role?: string;
  exp: number;
  iat: number;
}

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode.jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

// Check if token will expire soon (within the specified seconds)
export const isTokenExpiringSoon = (token: string, secondsThreshold = 120): boolean => {
  try {
    const decoded = jwtDecode.jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp - currentTime < secondsThreshold;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

// Get token expiration time in seconds
export const getTokenExpirationTime = (token: string): number | null => {
  try {
    const decoded = jwtDecode.jwtDecode<DecodedToken>(token);
    return decoded.exp;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get user info from token
export const getUserInfoFromToken = (token: string): { userId: string; email?: string; role?: string } | null => {
  try {
    const decoded = jwtDecode.jwtDecode<DecodedToken>(token);
    return {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};