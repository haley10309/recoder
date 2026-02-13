const express = require("express");
const router = express.Router();
const multer = require("multer");
const cors = require("cors");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

import { authenticate, authorize } from '../middleware/authMiddleware';
import authRoutes from './authRoutes';

import { checkTemplateExist } from '../controllers/common/checkTemplateExistController';
import { getTemplates } from '../controllers/common/getTemplatesController';
import { getTemplateDetails } from '../controllers/common/getTemplateDetailsController';
import { extractEnglishCopyList } from '../controllers/translationTemplates/extractEnglishCopyListController';
import { createTemplate } from '../controllers/codeTemplates/createTemplateController';
import { updateTemplate } from '../controllers/codeTemplates/updateTemplateController';
import { parseGuideFile } from '../controllers/codeTemplates/parseGuideFileController';
import { convertAsWasToToBeCodes } from '../controllers/applyCodeTemplates/convertAsWasToToBeCodesController';
import { parseTranslationFile } from '../controllers/applyTranslationTemplates/parseTranslationFileController';
import { updateLocalizationEntries } from '../controllers/translationTemplates/updateLocalizationEntriesController';

router.use('/auth', authRoutes);

// 가능한 role: ["pm", "qaer", "author"]

/** 0) Common */
router.get("/get-templates", cors(), authenticate, authorize("author", "qaer", "pm"), getTemplates);
router.post("/check-template-exsist", cors(), authenticate, authorize("author", "qaer", "pm"), checkTemplateExist);
router.post("/get-template-details", cors(), authenticate, authorize("author", "qaer", "pm"), getTemplateDetails);

/** 1) Code Templates */
router.post("/parse-guide-file", upload.single("txtfile"), cors(), authenticate, authorize("author", "qaer", "pm"), parseGuideFile);
router.post("/create-template", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), createTemplate); // ✅ Only pm (현재 임시로 전체 오픈)
router.post("/update-template", multer().none(), cors(), authenticate, authorize("author", "qaer", "pm"), updateTemplate); // ✅ Only pm (현재 임시로 전체 오픈)

/** 2) Apply Code Templates */
router.post("/convert-aswas-to-tobe-codes", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), convertAsWasToToBeCodes);

/** 3) Translation Templates */
router.post("/extract-english-copy-list", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), extractEnglishCopyList);
router.put("/update-localization-entries",cors(), authenticate, authorize("author", "qaer", "pm"), updateLocalizationEntries); // ✅ Only pm (현재 임시로 전체 오픈)

/** 4) Apply Translation Templates */
router.post("/parse-translation-file", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), parseTranslationFile);
// 2)와 동일한 `/convert-aswas-to-tobe-codes` 사용

export default router;