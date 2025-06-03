const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const authenticateToken = require("../middleware/auth");

/** 0) Common */
const getTicketNumController = require("../controllers/common/getTicketNumController");
const getTicketURLController = require("../controllers/common/getTicketURLController");
const checkTemplateController = require("../controllers/common/checkTemplateController");
const getTemplateDetailsController = require("../controllers/common/getTemplateDetailsController");
router.get("/get-ticket-number", cors(), getTicketNumController.getTicketNumData);
router.get("/get-ticket-url", cors(), getTicketURLController.getTicketURLData);
router.post("/check-template-exsist", cors(), checkTemplateController.checkTemplateData);
router.post("/get-template-details", cors(), getTemplateDetailsController.getTemplateDetailsData);

/** 1) Edit Template */
const createTemplateController = require("../controllers/editTemplate/createTemplateController");
const updateTemplateController = require("../controllers/editTemplate/updateTemplateController");
router.post("/create-template", upload.single('file'), cors(), createTemplateController.createTemplateData);
router.post("/update-template", multer().none(), cors(), updateTemplateController.updateTemplateData);

/** 2) Edit Localization Entries */
const localEnglishCopyController = require("../controllers/editLocalizationEntries/localEnglishCopyController"); 
const localizationController = require("../controllers/editLocalizationEntries/localTemplateController");
router.post("/extract-english-copy-list", upload.single('file'), cors(), localEnglishCopyController.extractEnglishCopyList);
router.put("/update-localization-entries",cors(), localizationController.updateLocalizationEntries);

/** 3) Apply Template */
const processFileController = require("../controllers/applyTemplate/processFileController");
router.post("/convert-aswas-to-tobe-codes", upload.single('file'), cors(), processFileController.convertAsWasToToBeCodes);

/** 4) Guide */
const guideUploadController = require("../controllers/guide/guideUploadController");
router.post("/guide-upload", upload.single("txtfile"), cors(), guideUploadController.guideUploadData);

/** 5) Admin */
// const loginController = require("../controllers/admin/login");
// const registerController = require("../controllers/admin/register");
// router.post("/admin/login", cors(), loginController.login);
// router.post("/admin/register", cors(), registerController.register);

/** (Deprecated) */
// const guideUploadControllerV2 = require("../controllers/guide/guideUploadControllerV2");
// router.post("/guide-upload", upload.single("txtfile"), cors(), guideUploadControllerV2.guideUploadData);
// const localUploadController = require("../controllers/editLocalizationEntries/localUploadController");
// router.post("/upload-translation", upload.single('file'), cors(), localUploadController.uploadTranslation);

module.exports = router;