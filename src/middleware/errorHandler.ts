import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

// Global error handler middleware
const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err.message);

    // Custom response based on error type
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || "Internal Server Error",
        ...(err.details && { details: err.details })
    });
};

export default errorHandler;