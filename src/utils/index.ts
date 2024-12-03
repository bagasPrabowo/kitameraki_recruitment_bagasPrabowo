import { Request, Response, NextFunction } from "express";

// Utility to handle async functions and reduce try-catch repetition
export const asyncHandler = (fn: Function) => 
    (req: Request, res: Response, next: NextFunction) => 
        Promise.resolve(fn(req, res, next)).catch(next);