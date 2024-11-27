import { Router } from "express";
import { protect, authorize } from "../middleware/protect.js";

import {
  register,
  login,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  logout,
  authMeUser,
  dashboard,
  updatePassword,
  userVoucherActive,
  invoiceByBookConfirmed,
  createInvoiceByBook,
  invoiceByBookLesson,
  createInvoiceByLesson,
  invoiceByQpayCheck,
} from "../controller/users.js";

const router = Router();

//"/api/v1/users"
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/dashboard").get(dashboard);
router.route("/update-password/:id").post(updatePassword);
router.route("/callback/:walletId/:userId/book").get(invoiceByBookConfirmed);
router.route("/callback/:walletId/:userId/lesson").get(invoiceByBookLesson);
router.use(protect);

//"/api/v1/users"
router
  .route("/")
  .get(authorize("admin"), getUsers)
  .post(authorize("admin"), createUser);
router.route("/me").get(protect, authMeUser);
router.route("/voucher").post(protect, userVoucherActive);
router.route("/create-invoice-by-book").post(createInvoiceByBook);
router.route("/create-invoice-by-lesson").post(createInvoiceByLesson);
router.route("/invoice-check/:id").get(invoiceByQpayCheck);
router.route("/:id").get(getUser).put(updateUser).delete(protect, deleteUser);

export default router;
