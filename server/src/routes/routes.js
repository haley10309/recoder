const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const authenticateToken = require("../middleware/auth");


/** 1) Edit Template */
const checkTemplateController = require("../controllers/editTemplate/checkTemplateController");
const createTemplateController = require("../controllers/editTemplate/createTemplateController");
const getTicketNumController = require("../controllers/editTemplate/getTicketNumController");
const getTicketURLController = require("../controllers/editTemplate/getTicketURLController");
const getTemplateDetailsController = require("../controllers/editTemplate/getTemplateDetailsController");
const updateTemplateController = require("../controllers/editTemplate/updateTemplateController");

/** 2) Edit Localization Entries */
const localUploadController = require("../controllers/editLocalizationEntries/localUploadController");
const localEnglishCopyController = require("../controllers/editLocalizationEntries/localEnglishCopyController"); 
const localizationController = require("../controllers/editLocalizationEntries/localTemplateController");

/** 3) Apply Template */
const processFileController = require("../controllers/applyTemplate/processFileController")
const templateController = require("../controllers/applyTemplate/templateController")

/** 4) Guide */
const guideUploadController = require("../controllers/guide/guideUploadController");
// const guideUploadControllerV2 = require("../controllers/guide/guideUploadControllerV2");

/** 5) Admin */
// const loginController = require("../controllers/admin/login");
// const registerController = require("../controllers/admin/register");


/** 1) Edit Template */
router.post("/check-template-exsist", cors(), checkTemplateController.checkTemplateData);
router.post("/get-template-details", cors(), getTemplateDetailsController.getTemplateDetailsData);
router.post("/create-template", upload.single('file'), cors(), createTemplateController.createTemplateData);
router.post("/update-template", multer().none(), cors(), updateTemplateController.updateTemplateData);
router.get("/get-ticket-number", cors(), getTicketNumController.getTicketNumData);
router.get("/get-ticket-url", cors(), getTicketURLController.getTicketURLData);

/** 2) Edit Localization Entries */
router.post("/translation_upload", upload.single('file'), cors(), localUploadController.localUploadData);
router.post("/localization/english-copy-list", upload.single('file'), cors(), localEnglishCopyController.extractEnglishCopyList);
router.put("/localization/template",cors(), localizationController.updateLocalizationFull);

/** 3) Apply Template */
router.post("/process-file", upload.single('file'), cors(), processFileController.processFileData);
router.post("/template", cors(), templateController.templateData);

/** 4) Guide */
router.post("/guide-upload", upload.single("txtfile"), cors(), guideUploadController.guideUploadData);
// router.post("/guide-upload", upload.single("txtfile"), cors(), guideUploadControllerV2.guideUploadData);

/** 5) Admin */
// router.post("/admin/login", cors(), loginController.login);
// router.post("/admin/register", cors(), registerController.register);

module.exports = router;