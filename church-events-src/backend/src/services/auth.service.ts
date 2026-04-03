import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { RegisterInput, LoginInput, JwtPayload } from '../types';
import crypto from 'crypto';
import { sendPasswordReset } from './email.service';
export const registerUser = async (input: RegisterInput) => {
  // Check if email already exists
  const existing = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existing) {
    throw new Error('Email already in use');
  }


  const hashedPassword = await bcrypt.hash(input.password, 10);

  // Create user in DB
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp,
      password: hashedPassword,
      role: 'USER',
    }
  });

  // Generate token immediately so user is logged in after register
  const token = generateToken({ userId: user.id, role: user.role });

  return {
    token,
    user: sanitizeUser(user)
  };
};

export const loginUser = async (input: LoginInput) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email }
  });

  // Same error message for wrong email OR wrong password
  // — never tell attacker which one is wrong
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.password);

  if (!passwordMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ userId: user.id, role: user.role });

  return {
    token,
    user: sanitizeUser(user)
  };
};

export const createStaffUser = async (
  input: RegisterInput,
  role: 'RESPONSIBLE' | 'ADMIN'
) => {
  const existing = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existing) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      whatsapp: input.whatsapp,
      password: hashedPassword,
      role,
    }
  });

  return sanitizeUser(user);
};


const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!) as string;
};

const sanitizeUser = (user: any) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
};

export const getResponsibleInfo = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true, whatsapp: true }
  });

  if (!user) throw new Error('User not found');
  return user;
};

export const getStaffUsers = async () => {
  return prisma.user.findMany({
    where: {
      role: { in: ['RESPONSIBLE', 'ADMIN'] }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' }
  });
};


export const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  console.log('forgotPassword called for:', email, 'user found:', !!user); 
  if (!user) return; // silent — don't reveal if email exists

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExp: expiry }
  });
 console.log('sending email to:', email); 
await sendPasswordReset(email, token);
 console.log('email sent');
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExp: { gt: new Date() }
    }
  });

  if (!user) throw new Error('Invalid or expired token');

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(password, 10),
      resetToken: null,
      resetTokenExp: null
    }
  });
};