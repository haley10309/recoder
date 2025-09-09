const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// const authenticateToken = require("../middleware/auth");

/** 0) Common */
const getTemplatesController = require("../controllers/common/getTemplatesController");
router.get("/get-templates", cors(), getTemplatesController.getTemplates);
const checkTemplateController = require("../controllers/common/checkTemplateController");
router.post("/check-template-exsist", cors(), checkTemplateController.checkTemplateData);
const getTemplateDetailsController = require("../controllers/common/getTemplateDetailsController");
router.post("/get-template-details", cors(), getTemplateDetailsController.getTemplateDetailsData);

/** 1) Code Templates */
const createTemplateController = require("../controllers/codeTemplates/createTemplateController");
router.post("/create-template", upload.single('file'), cors(), createTemplateController.createTemplateData);
const updateTemplateController = require("../controllers/codeTemplates/updateTemplateController");
router.post("/update-template", multer().none(), cors(), updateTemplateController.updateTemplateData);
const guideUploadController = require("../controllers/codeTemplates/guideUploadController");
router.post("/upload-guide", upload.single("txtfile"), cors(), guideUploadController.guideUploadData);

/** 2) Apply Code Templates */
const convertAsWasToToBeCodesController = require("../controllers/applyCodeTemplates/convertAsWasToToBeCodesController");
router.post("/convert-aswas-to-tobe-codes", upload.single('file'), cors(), convertAsWasToToBeCodesController.convertAsWasToToBeCodes);
const uploadTranslationController = require("../controllers/applyCodeTemplates/uploadTranslationController");
router.post("/upload-translation", upload.single('file'), cors(), uploadTranslationController.uploadTranslation);

/** 3) Translation Templates */
const extractEnglishCopyListController = require("../controllers/translationTemplates/extractEnglishCopyListController"); 
router.post("/extract-english-copy-list", upload.single('file'), cors(), extractEnglishCopyListController.extractEnglishCopyList);
const updateLocalizationEntriesController = require("../controllers/translationTemplates/updateLocalizationEntriesController");
router.put("/update-localization-entries",cors(), updateLocalizationEntriesController.updateLocalizationEntries);

/** (Deprecated) */
// const guideUploadControllerV2 = require("../controllers/codeTemplates/guideUploadControllerV2");
// router.post("/upload-guide", upload.single("txtfile"), cors(), guideUploadControllerV2.guideUploadData);

/** Admin */
// const loginController = require("../controllers/admin/login");
// const registerController = require("../controllers/admin/register");
// router.post("/admin/login", cors(), loginController.login);
// router.post("/admin/register", cors(), registerController.register);

module.exports = router;