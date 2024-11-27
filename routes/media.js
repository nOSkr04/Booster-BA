import { Router } from "express";
import {
  uploadPhoto,
  uploadPhotoByCloud,
  uploadVideo,
} from "../controller/media.js";

const router = Router();

//"/api/v1/ads"

router.route("/photo").post(uploadPhoto);
router.route("/video").post(uploadVideo);
router.route("/image").post(uploadPhotoByCloud);

export default router;
