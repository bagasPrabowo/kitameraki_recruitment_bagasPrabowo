import { Response, Request } from "express";
import logger from "../logger";

const getTask = (_req: Request, res: Response) => {
    try {
        res.json({ message: 'Welcome to Task Manager' });
    } catch (error: any) {
        logger.error(error)
        res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
    }
}

export { getTask };