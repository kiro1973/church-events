import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authService.loginUser(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    // role comes from request body, validated below
    const { role, ...userData } = req.body;

    if (!['RESPONSIBLE', 'ADMIN'].includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const user = await authService.createStaffUser(userData, role);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is set by authenticate middleware
    // we just return it — no DB call needed, info is in the token
    res.json(req.user);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};


export const getStaffUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await authService.getStaffUsers();
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: 'If this email exists, a reset link was sent' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};