const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const localUploadController = require("../controllers/localization/localUploadController");
const localEnglishCopyController = require("../controllers/localization/localEnglishCopyController"); 
const localGetTobecodeController = require("../controllers/localization/localGetTobecodeController");
const localizationController = require("../controllers/localization/localTemplateController");
const loaclDetailsController = require("../controllers/localization/localDetailsController");

router.post("/translation_upload", upload.single('file'), cors(), localUploadController.localUploadData);
router.post("/localization/english-copy", upload.single('file'), cors(), localEnglishCopyController.extractEnglishCopy);
router.post("/localization/tobe-code-list", cors(), localGetTobecodeController.getTobeCodeByTicket);
router.put("/localization/template",cors(), localizationController.updateLocalizationFull);
router.post("/localization/get-local-details", cors(), loaclDetailsController.getlocalDetails);

module.exports = router;