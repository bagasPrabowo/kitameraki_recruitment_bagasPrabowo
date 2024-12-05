import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user";
import { IUser } from "../types/user";
import Blacklist from "../models/blacklist";
import { asyncHandler, generateToken } from "../utils";
import logger from "../utils/logger";

export const postRegister = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  // Hashing Password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user: IUser = await User.create({ email, username, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully', data: user });
});

export const postLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user: IUser | null = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid Email or Password' });
  }

  const token = generateToken(user.id);
  res.status(200).json({ message: 'Login successful', token });
});

export const postLogout = async (req: Request, res: Response): Promise<void> => {
  const token = req.headers["x-user-token"] as string;

  const jwtSecret = process.env.JWT_SECRET || ""
  const decoded = jwt.verify(token.split(" ")[1], jwtSecret) as JwtPayload;
  await Blacklist.create({ token, expiry: new Date((decoded.exp || 1) * 1000) });

  res.status(200).json({ message: "Logged out successfully" });
};