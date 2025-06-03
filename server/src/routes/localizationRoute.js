const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const localUploadController = require("../controllers/localization/localUploadController");
const localEnglishCopyController = require("../controllers/localization/localEnglishCopyController"); 
const localizationController = require("../controllers/localization/localTemplateController");

router.post("/translation_upload", upload.single('file'), cors(), localUploadController.localUploadData);
router.post("/localization/english-copy-list", upload.single('file'), cors(), localEnglishCopyController.extractEnglishCopyList);
router.put("/localization/template",cors(), localizationController.updateLocalizationFull);

module.exports = router;