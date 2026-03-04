import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { AuthPayload } from '../types';
import { findUserById } from './store';
import Wallet from '../wallet';

export interface AuthRequest extends Request {
  user?: AuthPayload;
  wallet?: Wallet;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    const user = findUserById(decoded.userId);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = decoded;
    req.wallet = new Wallet({ privateKey: user.walletKeys.privateKey });

    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
