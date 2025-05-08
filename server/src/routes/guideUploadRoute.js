const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const guideUploadController = require("../controllers/guide/guideUploadController");
// const guideUploadControllerV2 = require("../controllers/guide/guideUploadControllerV2");

router.post("/guide-upload", upload.single("txtfile"), cors(), guideUploadController.guideUploadData);

// router.post("/guide-upload", upload.single("txtfile"), cors(), guideUploadControllerV2.guideUploadData);

module.exports = router;