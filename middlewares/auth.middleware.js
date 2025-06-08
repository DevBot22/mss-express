import { body, validationResult } from "express-validator";
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'


export const validateUserSignUp = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({min: 6}).withMessage('Password must a least 6 characters'),
    (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        next()
    }
]

export const validateUserLogin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password required'),
    (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }
        next()
    }
]

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        return res.status(404).json({ message: 'User not found' });
      }
      console.log('Protected user:', req.user);
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ message: 'No token, not authorized' });
  }
};
