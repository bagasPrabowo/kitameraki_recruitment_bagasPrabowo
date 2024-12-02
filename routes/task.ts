import express from "express";

const router = express.Router();

router.get('/', async (_req, res) => {
    try {
        res.status(200).json({ message: 'Welcome to Task Manager' });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router;