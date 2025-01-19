import { Router } from "express";
import { protect } from "../middleware/protect.js";

import { getNotifications } from "../controller/notifications.js";

const router = Router();

//"/api/v1/articles"
router.route("/").get(protect, getNotifications);

export default router;
