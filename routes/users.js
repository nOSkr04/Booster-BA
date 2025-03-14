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
  invoiceByBookConfirmed,
  createInvoiceByBook,
  invoiceByBookLesson,
  createInvoiceByLesson,
  invoiceByQpayCheck,
  updateProfile,
  createInvoiceByPackage,
  invoiceByBookPackage,
  forgotPassword,
  forgotChangePassword,
  deleteUserMe,
  massSendNotification,
} from "../controller/users.js";

const router = Router();

//"/api/v1/users"

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/forgot-change-password").post(forgotChangePassword);
router.route("/dashboard").get(dashboard);
router.route("/update-password/:id").post(updatePassword);
router.route("/callback/:walletId/:userId/book").get(invoiceByBookConfirmed);
router.route("/callback/:walletId/:userId/lesson").get(invoiceByBookLesson);
router.route("/callback/:walletId/:userId/package").get(invoiceByBookPackage);

router.use(protect);

//"/api/v1/users"
router
  .route("/")
  .get(authorize("admin"), getUsers)
  .post(authorize("admin"), createUser);
router.route("/me").get(protect, authMeUser);
router.route("/update-profile").put(updateProfile);
router.route("/create-invoice-by-book").post(createInvoiceByBook);
router.route("/create-invoice-by-package").post(createInvoiceByPackage);
router.route("/create-invoice-by-lesson").post(createInvoiceByLesson);
router.route("/invoice-check/:id/:type").get(invoiceByQpayCheck);
router.route("/delete").delete(protect, deleteUserMe);
router.route("/mass-notification").post(protect, massSendNotification);
router.route("/:id").get(getUser).put(updateUser).delete(protect, deleteUser);

export default router;
