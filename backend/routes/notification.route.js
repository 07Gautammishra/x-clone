import express from 'express'
import { deleteNotification, getAllNotification } from '../controllers/notification.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';

const router = express.Router()

router.get("/", protectRoute, getAllNotification)
router.delete("/",protectRoute, deleteNotification)
// router.delete("/:id",protectRoute, deleteOneNotification)
export default router;