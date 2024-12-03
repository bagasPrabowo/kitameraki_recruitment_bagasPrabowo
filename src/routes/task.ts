import { Router } from "express";
import { getTask } from "../controllers/task";

const router: Router = Router();

router.get('/', getTask);

export default router;