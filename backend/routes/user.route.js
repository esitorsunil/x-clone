import express from "express";
import { getProfile } from "../controllers/user.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getProfile)

export default router;