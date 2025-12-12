const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import { authenticate } from '../middleware/authMiddleware';
import authRoutes from './authRoutes';

import { checkTemplateData } from '../controllers/common/checkTemplateController';
import { getTemplates } from '../controllers/common/getTemplatesController';
import { getTemplateDetailsData } from '../controllers/common/getTemplateDetailsController';
import { extractEnglishCopyListData } from '../controllers/translationTemplates/extractEnglishCopyListController';
import { createTemplateData } from '../controllers/codeTemplates/createTemplateController';
import { updateTemplateData } from '../controllers/codeTemplates/updateTemplateController';
import { guideUploadData } from '../controllers/codeTemplates/guideUploadController';
import { convertAsWasToToBeCodes } from '../controllers/applyCodeTemplates/convertAsWasToToBeCodesController';
import { uploadTranslation } from '../controllers/applyCodeTemplates/uploadTranslationController';
import { updateLocalizationEntries } from '../controllers/translationTemplates/updateLocalizationEntriesController';

router.use('/auth', authRoutes);

/** 0) Common */
router.get("/get-templates", cors(), authenticate, getTemplates);
router.post("/check-template-exsist", cors(), authenticate, checkTemplateData);
router.post("/get-template-details", cors(), authenticate, getTemplateDetailsData);

/** 1) Code Templates */
router.post("/create-template", upload.single('file'), cors(), authenticate, createTemplateData);
router.post("/update-template", multer().none(), cors(), authenticate, updateTemplateData);
router.post("/upload-guide", upload.single("txtfile"), cors(), authenticate, guideUploadData);

/** 2) Apply Code Templates */
router.post("/convert-aswas-to-tobe-codes", upload.single('file'), cors(), authenticate, convertAsWasToToBeCodes);
router.post("/upload-translation", upload.single('file'), cors(), authenticate, uploadTranslation);

/** 3) Translation Templates */
router.post("/extract-english-copy-list", upload.single('file'), cors(), authenticate, extractEnglishCopyListData);
router.put("/update-localization-entries",cors(), authenticate, updateLocalizationEntries);

/** (Deprecated) */
// const guideUploadControllerV2 = require("../controllers/codeTemplates/guideUploadControllerV2");
// router.post("/upload-guide", upload.single("txtfile"), cors(), guideUploadControllerV2.guideUploadData);

/** Admin */
// const loginController = require("../controllers/admin/login");
// const registerController = require("../controllers/admin/register");
// router.post("/admin/login", cors(), loginController.login);
// router.post("/admin/register", cors(), registerController.register);

module.exports = router;