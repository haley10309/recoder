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
import { extractUnpackExcel } from '../controllers/unpackTemplates/extractUnpackExcelController';
import { getUnpackTemplateDetails } from '../controllers/unpackTemplates/getUnpackTemplateDetailsController';
import { saveUnpackTemplate } from '../controllers/unpackTemplates/saveUnpackTemplateController';
import { getUnpackTemplateDetailsWithExcel } from '../controllers/unpackTemplates/getUnpackTemplateDetailsWithExcelController';
import { processCopy } from '../controllers/unpackTemplates/processCopyController';
import { applyToHtml } from '../controllers/unpackTemplates/applyToHtmlController';
import { applyLocalization } from '../controllers/applyTranslationTemplates/applyLocalizationController';
import { verifyTranslationQa } from '../controllers/translationQa/verifyTranslationQaController';
import { savePreCoderResult } from '../controllers/preCoder/savePreCoderResultController';
import { getPreCoderResults } from '../controllers/preCoder/getPreCoderResultsController';
import { getPreCoderResultDetail } from '../controllers/preCoder/getPreCoderResultDetailController';
import { downloadPreCoderExcel } from '../controllers/preCoder/downloadPreCoderExcelController';
import { updatePreCoderResultTitle } from '../controllers/preCoder/updatePreCoderResultTitleController';
import { extractFaqCopyDeck } from '../controllers/preCoder/extractFaqCopyDeckController';

router.use('/auth', authRoutes);

// 가능한 role: ["pm", "qaer", "author"]

/** 0) Common */
router.get("/get-templates", cors(), authenticate, authorize("author", "qaer", "pm"), getTemplates);
router.post("/check-template-exsist", cors(), authenticate, authorize("author", "qaer", "pm"), checkTemplateExist);
router.post("/get-template-details", cors(), authenticate, authorize("author", "qaer", "pm"), getTemplateDetails);

/** 1) Code Templates */
router.post("/parse-guide-file",upload.fields([{ name: "asWasFile", maxCount: 1 },{ name: "toBeFile", maxCount: 1 },]),parseGuideFile);
router.post("/create-template", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), createTemplate); // ✅ Only pm (현재 임시로 전체 오픈)
router.post("/update-template", multer().none(), cors(), authenticate, authorize("author", "qaer", "pm"), updateTemplate); // ✅ Only pm (현재 임시로 전체 오픈)

/** 2) Apply Code Templates */
router.post("/convert-aswas-to-tobe-codes", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), convertAsWasToToBeCodes);

/** 3) Translation Templates */
router.post("/extract-english-copy-list", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), extractEnglishCopyList);
router.put("/update-localization-entries",cors(), authenticate, authorize("author", "qaer", "pm"), updateLocalizationEntries); // ✅ Only pm (현재 임시로 전체 오픈)

/** 4) Apply Translation Templates */
router.post("/parse-translation-file", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), parseTranslationFile);
router.post("/apply-localization", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), applyLocalization);
// +) 2)와 동일한 `/convert-aswas-to-tobe-codes` 사용

/** 5) Unpack */
router.post("/unpack-templates/get-details", cors(), authenticate, authorize("author", "qaer", "pm"), getUnpackTemplateDetails);
router.post("/unpack-templates/extract", upload.single('file'), cors(), extractUnpackExcel);
router.post("/unpack-templates/save", cors(), authenticate, authorize("author", "qaer", "pm"), saveUnpackTemplate);
router.post("/unpack-templates/get-details-with-excel", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), getUnpackTemplateDetailsWithExcel);
router.post("/unpack-templates/process-copy", cors(), authenticate, authorize("author", "qaer", "pm"), processCopy);
router.post("/unpack-templates/apply-to-html", upload.single('file'), cors(), authenticate, authorize("author", "qaer", "pm"), applyToHtml);

/** 6) Translation QA (언팩 번역이 after.html에 잘 반영됐는지 검사) */
router.post(
  "/translation-qa/verify",
  upload.fields([
    { name: "beforeFile", maxCount: 1 },
    { name: "afterFile", maxCount: 1 },
    { name: "excelFile", maxCount: 1 },
  ]),
  cors(),
  verifyTranslationQa
);

/** 7) Pre Coder (recoder 입력 전 html/카피덱 검사 + 결과 공유) */
router.post(
  "/pre-coder/save",
  upload.fields([
    { name: "htmlFile", maxCount: 1 },
    { name: "excelFile", maxCount: 1 },
  ]),
  cors(),
  authenticate,
  savePreCoderResult
);
router.get("/pre-coder/list", cors(), authenticate, getPreCoderResults);
router.get("/pre-coder/:id", cors(), authenticate, getPreCoderResultDetail);
router.get("/pre-coder/:id/excel", cors(), authenticate, downloadPreCoderExcel);
router.patch("/pre-coder/:id/title", cors(), authenticate, updatePreCoderResultTitle);
router.post("/pre-coder/faq/extract-copydeck", upload.single("file"), cors(), extractFaqCopyDeck);

export default router;