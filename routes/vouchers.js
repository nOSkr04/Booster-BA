import { Router } from "express";
import { protect, authorize } from "../middleware/protect.js";
import { createVoucher, getVouchers } from "../controller/vouchers.js";

const router = Router();

//"/api/v1/articles"
router
  .route("/")
  .get(protect, getVouchers)
  .post(protect, authorize("admin", "operator"), createVoucher);

export default router;
