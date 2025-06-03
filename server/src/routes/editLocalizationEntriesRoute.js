const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const localUploadController = require("../controllers/editLocalizationEntries/localUploadController");
const localEnglishCopyController = require("../controllers/editLocalizationEntries/localEnglishCopyController"); 
const localizationController = require("../controllers/editLocalizationEntries/localTemplateController");

router.post("/translation_upload", upload.single('file'), cors(), localUploadController.localUploadData);
router.post("/localization/english-copy-list", upload.single('file'), cors(), localEnglishCopyController.extractEnglishCopyList);
router.put("/localization/template",cors(), localizationController.updateLocalizationFull);

module.exports = router;