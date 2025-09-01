const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const authenticateToken = require("../middleware/auth");

/** 0) Common */
const getTemplatesController = require("../controllers/common/getTemplatesController");
const checkTemplateController = require("../controllers/common/checkTemplateController");
const getTemplateDetailsController = require("../controllers/common/getTemplateDetailsController");
router.get("/get-templates", cors(), getTemplatesController.getTemplates);
router.post("/check-template-exsist", cors(), checkTemplateController.checkTemplateData);
router.post("/get-template-details", cors(), getTemplateDetailsController.getTemplateDetailsData);

/** 1) Code Templates */
const createTemplateController = require("../controllers/codeTemplates/createTemplateController");
const updateTemplateController = require("../controllers/codeTemplates/updateTemplateController");
const guideUploadController = require("../controllers/guide/guideUploadController");
router.post("/create-template", upload.single('file'), cors(), createTemplateController.createTemplateData);
router.post("/update-template", multer().none(), cors(), updateTemplateController.updateTemplateData);
router.post("/upload-guide", upload.single("txtfile"), cors(), guideUploadController.guideUploadData);

/** 2) Manage Localization Entries */
const localEnglishCopyController = require("../controllers/manageLocalizationEntries/localEnglishCopyController"); 
const localizationController = require("../controllers/manageLocalizationEntries/localTemplateController");
router.post("/extract-english-copy-list", upload.single('file'), cors(), localEnglishCopyController.extractEnglishCopyList);
router.put("/update-localization-entries",cors(), localizationController.updateLocalizationEntries);

/** 3) Template Mapping */
const processFileController = require("../controllers/templateMapping/processFileController");
router.post("/convert-aswas-to-tobe-codes", upload.single('file'), cors(), processFileController.convertAsWasToToBeCodes);
const localUploadController = require("../controllers/templateMapping/localUploadController");
router.post("/upload-translation", upload.single('file'), cors(), localUploadController.uploadTranslation);
const getCountryTemplateDetailsController = require("../controllers/common/getCountryTemplateDetailsController");
router.post("/get-country-template-details", cors(), getCountryTemplateDetailsController.getCountryTemplateDetailsData);
const templatesByCountryController = require("../controllers/common/templatesByCountryController");
router.put("/templates-by-country", multer().none(), cors(), templatesByCountryController.putTemplatesByCountry);
router.delete("/templates-by-country", cors(), templatesByCountryController.deleteTemplatesByCountry);

/** (Deprecated) */
// const guideUploadControllerV2 = require("../controllers/guide/guideUploadControllerV2");
// router.post("/upload-guide", upload.single("txtfile"), cors(), guideUploadControllerV2.guideUploadData);

/** Admin */
// const loginController = require("../controllers/admin/login");
// const registerController = require("../controllers/admin/register");
// router.post("/admin/login", cors(), loginController.login);
// router.post("/admin/register", cors(), registerController.register);

module.exports = router;