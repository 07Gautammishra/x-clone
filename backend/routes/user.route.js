import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js';
import { followAndUnFollowUser, getSuggestedProfile, getUserProfile, updateUser, } from '../controllers/user.controller.js';

const router= express.Router();

router.get("/profile/:username", protectRoute, getUserProfile)
router.get("/suggested", protectRoute, getSuggestedProfile)
router.post("/follow/:id", protectRoute, followAndUnFollowUser)
router.post("/update", protectRoute, updateUser)


export default router;