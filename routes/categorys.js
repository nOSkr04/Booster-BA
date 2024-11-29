import { Router } from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getCategorys,
  getCategory,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../controller/cateogry.js";

const router = Router();

//"/api/v1/categorys"
router
  .route("/")
  .get(getCategorys)
  .post(protect, authorize("admin", "operator"), createCategory);

router
  .route("/:id")
  .get(getCategory)
  .delete(protect, authorize("admin", "operator"), deleteCategory)
  .put(protect, authorize("admin", "operator"), updateCategory);

export default router;
