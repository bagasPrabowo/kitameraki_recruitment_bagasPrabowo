import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Utility to handle async functions and reduce try-catch repetition
export const asyncHandler = (fn: Function) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Utility to generate JWT
export const generateToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET || "";
  const jwtExpires = process.env.JWT_EXPIRES || "15m";
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpires });
};