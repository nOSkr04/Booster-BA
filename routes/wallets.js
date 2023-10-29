import { Router } from "express";
const router = Router();
import { protect, authorize } from "../middleware/protect.js";

import {
  getWallets,
  getWallet,
  getCvWallets,
  createWallet,
  updateWallet,
  deleteWallet,
} from "../controller/wallets.js";

//"/api/v1/wallets"
router.route("/").get(getWallets).post(protect, createWallet);

router
  .route("/:id")
  .get(getWallet)
  .put(protect, authorize("admin", "operator"), updateWallet)
  .delete(protect, authorize("admin"), deleteWallet);

router.route("/:cvId/wallet").get(protect, authorize("admin"), getCvWallets);
export default router;
