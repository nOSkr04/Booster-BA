import { Router } from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getBanners,
  getBanner,
  createBanner,
  deleteBanner,
  updateBanner,
} from "../controller/banner.js";

const router = Router();

//"/api/v1/banners"
router
  .route("/")
  .get(getBanners)
  .post(protect, authorize("admin", "operator"), createBanner);

router
  .route("/:id")
  .get(getBanner)
  .delete(protect, authorize("admin", "operator"), deleteBanner)
  .put(protect, authorize("admin", "operator"), updateBanner);

export default router;
