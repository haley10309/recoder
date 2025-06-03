const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const processFileController = require("../controllers/applyTemplate/processFileController")
const templateController = require("../controllers/applyTemplate/templateController")

router.post("/process-file", upload.single('file'), cors(), processFileController.processFileData);
router.post("/template", cors(), templateController.templateData);

module.exports = router;