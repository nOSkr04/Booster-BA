import { Router } from "express";
import { protect, authorize } from "../middleware/protect.js";
import {
  lessonPaymentSuccess,
  bookPaymentSuccess,
  payedDashboard,
} from "../controller/admins.js";

const router = Router();

//"/api/v1/articles"
router
  .route("/lesson-payment")
  .post(protect, authorize("admin", "operator"), lessonPaymentSuccess);
router
  .route("/book-payment")
  .post(protect, authorize("admin", "operator"), bookPaymentSuccess);

router.get("/payedDashboard", payedDashboard);

export default router;
