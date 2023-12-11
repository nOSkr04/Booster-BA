import { Router } from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  getArticles,
  getArticle,
  createArticle,
  deleteArticle,
  updateArticle,
  getCategoryArticles,
} from "../controller/articles.js";

const router = Router();

//"/api/v1/articles"
router
  .route("/")
  .get(protect, getArticles)
  .post(protect, authorize("admin", "operator"), createArticle);

router.route("/category/:id/articles").get(protect, getCategoryArticles);

router
  .route("/:id")
  .get(getArticle)
  .delete(protect, authorize("admin", "operator"), deleteArticle)
  .put(protect, authorize("admin", "operator"), updateArticle);

export default router;
