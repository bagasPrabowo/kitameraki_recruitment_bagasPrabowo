import { Request, Response, NextFunction } from "express";
import Blacklist from "../models/blacklist";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { IBlacklist } from "../types/blacklist";
import { IUser } from "../types/user";
import logger from "../utils/logger";

export interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers["x-user-token"] as string;

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || "";
  const blacklisted: IBlacklist | null = await Blacklist.findOne({ token });

  if (blacklisted) {
    res.status(401).json({ message: "Token has been Invalidated" });
    return;
  }

  jwt.verify(token.split(" ")[1], jwtSecret, async (err, decoded) => {
    if (err) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    const data = decoded as { id: string; };
    const user: IUser | null = await User.findOne({ id: data.id });

    if (!user) {
      res.status(401).json({ message: "Invalid User token" });
      return;
    }

    req.user = { id: data.id };
    next();
  });
};