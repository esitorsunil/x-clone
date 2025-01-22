import express from "express";
import { getProfile, followUnfollowUser, getSuggestedUsers} from "../controllers/user.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getProfile)
router.post("/follow/:id", protectRoute, followUnfollowUser)
router.get("/suggested", protectRoute, getSuggestedUsers)

export default router;