const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import { authenticate, authorize } from '../middleware/authMiddleware';
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

// 가능한 role: ["pm", "qaer", "author"]

/** 0) Common */
router.get("/get-templates", cors(), authenticate, authorize("author", "qaer", "pm"), getTemplates);
router.post("/check-template-exsist", cors(), authenticate, authorize("author", "qaer", "pm"), checkTemplateData);
router.post("/get-template-details", cors(), authenticate, authorize("author", "qaer", "pm"), getTemplateDetailsData);

/** 1) Code Templates */
router.post("/create-template", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), createTemplateData); // ✅ Only pm (현재 임시로 전체 오픈)
router.post("/update-template", multer().none(), cors(), authenticate, authorize("author", "qaer", "pm"), updateTemplateData); // ✅ Only pm (현재 임시로 전체 오픈)
router.post("/upload-guide", upload.single("txtfile"), cors(), authenticate, authorize("author", "qaer", "pm"), guideUploadData);

/** 2) Apply Code Templates */
router.post("/convert-aswas-to-tobe-codes", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), convertAsWasToToBeCodes);
router.post("/upload-translation", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), uploadTranslation);

/** 3) Translation Templates */
router.post("/extract-english-copy-list", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), extractEnglishCopyListData);
router.put("/update-localization-entries",cors(), authenticate, authorize("author", "qaer", "pm"), updateLocalizationEntries); // ✅ Only pm (현재 임시로 전체 오픈)

/** (Deprecated) */
// const guideUploadControllerV2 = require("../controllers/codeTemplates/guideUploadControllerV2");
// router.post("/upload-guide", upload.single("txtfile"), cors(), guideUploadControllerV2.guideUploadData);

/** Admin */
// const loginController = require("../controllers/admin/login");
// const registerController = require("../controllers/admin/register");
// router.post("/admin/login", cors(), loginController.login);
// router.post("/admin/register", cors(), registerController.register);

export default router;