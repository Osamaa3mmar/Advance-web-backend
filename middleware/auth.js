import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const getUser = (token) => {
  if (!token) return null;
  
  try {
    // Remove "Bearer " prefix if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }
    
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user;
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return null;
  }
};

export default getUser;
