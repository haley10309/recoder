import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { Request, Response } from "express";

import { UnpackRow } from "../../types/unpack.types";
import {
  TranslationQaBlock,
  VerifyTranslationQaResponse,
} from "../../types/translationQa.types";

// ────────────────────────────────────────────────────────────────────────────
// 공통 유틸 (applyToHtmlController / processCopyController 와 동일한 규칙)
// ────────────────────────────────────────────────────────────────────────────

const isTrue = (value: unknown): boolean => {
  if (typeof value === "string") {
    return ["true", "o", "O"].includes(value.trim());
  }
  return value === true;
};

const escapeRegExp = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const normalize = (value: string | null | undefined): string => {
  return (value ?? "").replace(/\s+/g, " ").trim();
};

// data-copy-set="C01-001" -> { attr: "data-copy-set", value: "C01-001" }
const parseTargetSelector = (
  targetSelector: string
): { attr: string; value: string } | null => {
  const match = targetSelector.match(/^([\w-]+)=["']([^"']+)["']$/);
  if (!match) return null;
  return { attr: match[1], value: match[2].trim() };
};

const isCopySetSelector = (targetSelector: string): boolean => {
  return /^data-copy-set=["'][A-Za-z]+\d+(?:-\d+)+\s*["']$/.test(targetSelector);
};

const isSupSelector = (targetSelector: string): boolean => {
  return /^data-sup=["']sup-\d+["']$/.test(targetSelector);
};

// data-copy-set="F08-014" -> "F08-014"
const getCopySetNumber = (targetSelector: string): string => {
  const parsed = parseTargetSelector(targetSelector);
  return parsed ? parsed.value : targetSelector;
};

// ────────────────────────────────────────────────────────────────────────────
// 기대 카피 계산 (processCopyController.processTranslatedCopy 와 동일한 변환 규칙)
// ────────────────────────────────────────────────────────────────────────────

const computeExpectedCopy = (row: UnpackRow): string => {
  let copy = row.translated_copy ?? "";

  if (row.apply_type === "innerText" && isTrue(row.enable_text_transform)) {
    const lastDotIndex = copy.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      copy = copy.slice(0, lastDotIndex + 1).trim();
    }
  }

  if (row.apply_type === "text_disclaimer" && isTrue(row.enable_text_transform)) {
    copy = copy.replace(/^\d+\.\s*/, "").trim();
  }

  return copy;
};

// ────────────────────────────────────────────────────────────────────────────
// HTML에서 요소/값 추출
// ────────────────────────────────────────────────────────────────────────────

// target_selector에 해당하는 요소의 outerHTML을 그대로 반환 (표시용)
const extractElementHtml = (
  html: string,
  targetSelector: string
): string | null => {
  const parsed = parseTargetSelector(targetSelector);
  if (!parsed) return null;

  const targetAttr = escapeRegExp(parsed.attr);
  const targetValue = escapeRegExp(parsed.value);

  // 컨테이너형(열림~닫힘) 요소 우선 매칭
  const blockRegex = new RegExp(
    `<([a-zA-Z][\\w:-]*)[^>]*\\s${targetAttr}=["']${targetValue}["'][^>]*>[\\s\\S]*?</\\1>`,
    "i"
  );
  const blockMatch = html.match(blockRegex);
  if (blockMatch) return blockMatch[0];

  // self-closing / void 요소 (img 등)
  const selfClosingRegex = new RegExp(
    `<[a-zA-Z][\\w:-]*[^>]*\\s${targetAttr}=["']${targetValue}["'][^>]*/?>`,
    "i"
  );
  const selfMatch = html.match(selfClosingRegex);
  if (selfMatch) return selfMatch[0];

  return null;
};

// 여는 태그에서 특정 속성값(alt, aria-label 등)을 추출
const extractAttribute = (
  elementHtml: string,
  attrName: string
): string | null => {
  const attrRegex = new RegExp(`${escapeRegExp(attrName)}=["']([^"']*)["']`, "i");
  const match = elementHtml.match(attrRegex);
  return match ? match[1] : null;
};

// 컨테이너 요소의 innerHTML(안쪽 내용)을 추출
const extractInnerHtml = (elementHtml: string): string | null => {
  const match = elementHtml.match(/^<[a-zA-Z][\w:-]*[^>]*>([\s\S]*)<\/[a-zA-Z][\w:-]*>$/);
  return match ? match[1] : null;
};

// sup 블록 안의 disclaimer(data-copy-set="disclaimer") inner를 추출
const extractDisclaimerInner = (elementHtml: string): string | null => {
  const disclaimerRegex =
    /<([a-zA-Z][\w:-]*)[^>]*\sdata-copy-set=["']disclaimer["'][^>]*>([\s\S]*?)<\/\1>/i;
  const match = elementHtml.match(disclaimerRegex);
  return match ? match[2] : null;
};

// target_selector + apply_type 기준으로 after 요소에서 "실제 적용된 값"을 추출
const extractAppliedValue = (
  elementHtml: string,
  applyType: string
): string | null => {
  if (applyType === "alt") return extractAttribute(elementHtml, "alt");
  if (applyType === "aria-label") return extractAttribute(elementHtml, "aria-label");
  if (applyType === "innerText") return extractInnerHtml(elementHtml);
  if (applyType === "text_disclaimer") return extractDisclaimerInner(elementHtml);
  return null;
};

// ────────────────────────────────────────────────────────────────────────────
// row 하나에 대한 검사
// ────────────────────────────────────────────────────────────────────────────

const buildBlock = (
  row: UnpackRow,
  index: number,
  beforeHtml: string,
  afterHtml: string
): TranslationQaBlock => {
  const targetSelector = row.target_selector;
  const applyType = row.apply_type;
  const copySetNumber = getCopySetNumber(targetSelector);
  const expectedCopy = computeExpectedCopy(row);

  const beforeElement = extractElementHtml(beforeHtml, targetSelector);
  const beforeCode = beforeElement ?? "";
  const afterElement = extractElementHtml(afterHtml, targetSelector);
  const afterCode = afterElement ?? "";

  // 번역 전 원문(original_copy)이 before.html의 해당 data-copy-set에 실제로 존재하는지.
  // 이게 true면 = 번역 대상 카피가 맞으므로, after가 틀렸을 때 정답 번역을 제시한다.
  const beforeValue = beforeElement
    ? extractAppliedValue(beforeElement, applyType)
    : null;
  const normalizedOriginal = normalize(row.original_copy);
  const originalInBefore =
    !!normalizedOriginal &&
    (normalize(beforeValue).includes(normalizedOriginal) ||
      normalize(beforeCode).includes(normalizedOriginal));

  const base = {
    index,
    copySetNumber,
    targetSelector,
    apply_type: applyType,
    original_copy: row.original_copy ?? "",
    expected_copy: expectedCopy,
    beforeCode,
    afterCode,
    originalInBefore,
  };

  // before에 원문이 있을 때만 "정답 번역"을 제시한다 (번역 대상임이 확인된 카피)
  const correctAnswer =
    originalInBefore && normalize(expectedCopy) ? expectedCopy : undefined;

  // after.html에서 해당 요소를 못 찾은 경우
  if (!afterElement) {
    return {
      ...base,
      afterValue: null,
      matched: false,
      resultText: "매칭 실패한 카피가 있습니다.",
      failReason: `after.html에서 ${targetSelector} 요소를 찾을 수 없습니다.`,
      correctAnswer,
    };
  }

  const afterValue = extractAppliedValue(afterElement, applyType);
  const normalizedAfter = normalize(afterValue);
  const normalizedExpected = normalize(expectedCopy);

  // 기대 번역 카피가 비어있으면 검증 불가 → 실패 처리
  if (!normalizedExpected) {
    return {
      ...base,
      afterValue,
      matched: false,
      resultText: "매칭 실패한 카피가 있습니다.",
      failReason: "카피덱(xlsx)에 해당 국가의 번역 카피가 비어 있습니다.",
    };
  }

  const matched = !!normalizedAfter && normalizedAfter.includes(normalizedExpected);

  if (matched) {
    return {
      ...base,
      afterValue,
      matched: true,
      resultText: `${expectedCopy} 카피 적용됨.`,
    };
  }

  // 매칭 실패 — after에 번역 전 원문이 그대로 남아있으면 "아직 미번역", 아니면 "오역/다른 값"
  const afterStillOriginal =
    !!normalizedOriginal && normalizedAfter.includes(normalizedOriginal);
  const failReason = afterStillOriginal
    ? "번역 전 원문이 그대로 남아있습니다. 아직 번역이 반영되지 않았습니다."
    : "번역 카피가 after.html에 반영되지 않았습니다.";

  return {
    ...base,
    afterValue,
    matched: false,
    resultText: "매칭 실패한 카피가 있습니다.",
    failReason,
    correctAnswer,
  };
};

const verifyRows = (
  rows: UnpackRow[],
  beforeHtml: string,
  afterHtml: string
): TranslationQaBlock[] => {
  return rows
    .filter((row) => {
      const selector = row.target_selector;
      if (!selector || !row.apply_type) return false;
      // 지원하는 셀렉터 형식만 검사 (unpack apply-to-html과 동일 범위)
      return isCopySetSelector(selector) || isSupSelector(selector);
    })
    .map((row, idx) => buildBlock(row, idx, beforeHtml, afterHtml));
};

// ────────────────────────────────────────────────────────────────────────────
// 컨트롤러: before.html / after.html / copy.xlsx + site_code
//   copy.xlsx는 기존 extract_unpack_excel(.exe/.py)을 그대로 재사용해 파싱한다.
// ────────────────────────────────────────────────────────────────────────────

type PythonResult =
  | { row_list: UnpackRow[] }
  | { errorMsg: string; statusCode: number };

export const verifyTranslationQa = async (
  req: Request,
  res: Response<VerifyTranslationQaResponse>
): Promise<void> => {
  try {
    const files = req.files as
      | { [field: string]: Express.Multer.File[] }
      | undefined;
    const beforeFile = files?.["beforeFile"]?.[0];
    const afterFile = files?.["afterFile"]?.[0];
    const excelFile = files?.["excelFile"]?.[0];

    if (!beforeFile || !afterFile || !excelFile) {
      res.status(400).json({
        success: false,
        error: "beforeFile, afterFile, excelFile이 모두 필요합니다.",
      });
      return;
    }

    const siteCode =
      typeof req.body.site_code === "string" ? req.body.site_code.trim() : "";
    if (!siteCode) {
      res.status(400).json({ success: false, error: "site_code가 필요합니다." });
      return;
    }

    const beforeHtml = beforeFile.buffer.toString("utf-8");
    const afterHtml = afterFile.buffer.toString("utf-8");

    // 엑셀을 임시 파일로 저장 후 파이썬(또는 pkg exe)으로 파싱
    const uniqueFileName = `${Date.now()}_${excelFile.originalname}`;
    const tempPath = path.join(os.tmpdir(), uniqueFileName);
    fs.writeFileSync(tempPath, excelFile.buffer);

    const pythonScriptPath = path.join(
      process.cwd(),
      "src",
      "controllers",
      "unpackTemplates",
      "extract_unpack_excel.py"
    );

    const isPkg = !!(process as any).pkg;
    const command = isPkg
      ? path.join(path.dirname(process.execPath), "extract_unpack_excel.exe")
      : "python";
    const args = isPkg
      ? [tempPath, siteCode]
      : [pythonScriptPath, tempPath, siteCode];

    const py = spawn(command, args, { cwd: process.cwd() });

    let stdout = "";
    let stderr = "";
    let responseSent = false;

    const cleanupTempFile = () => {
      try {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      } catch (unlinkError) {
        console.error("temp file delete error:", unlinkError);
      }
    };

    const safeSend = (
      statusCode: number,
      body: VerifyTranslationQaResponse
    ) => {
      if (responseSent) return;
      responseSent = true;
      res.status(statusCode).json(body);
    };

    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    py.on("close", (code) => {
      cleanupTempFile();

      let result: PythonResult;
      try {
        result = JSON.parse(stdout);
      } catch {
        console.error("python stderr:", stderr);
        console.error("python stdout:", stdout);
        safeSend(500, { success: false, error: "엑셀 파싱 응답 형식이 올바르지 않습니다." });
        return;
      }

      if ("errorMsg" in result) {
        safeSend(result.statusCode || 500, {
          success: false,
          error: result.errorMsg,
        });
        return;
      }

      if (code !== 0) {
        safeSend(500, { success: false, error: "엑셀 파싱에 실패했습니다." });
        return;
      }

      try {
        const rows: UnpackRow[] = result.row_list.map((row) => ({
          ...row,
          exclude_sup: isTrue(row.exclude_sup),
          enable_text_transform: isTrue(row.enable_text_transform),
        }));

        const blocks = verifyRows(rows, beforeHtml, afterHtml);
        safeSend(200, { success: true, blocks });
      } catch (verifyError) {
        console.error("[verifyTranslationQa] verify error:", verifyError);
        safeSend(500, { success: false, error: "검사 처리 중 오류가 발생했습니다." });
      }
    });

    py.on("error", (error) => {
      cleanupTempFile();
      console.error("python spawn error:", error);
      safeSend(500, { success: false, error: "엑셀 파싱 프로세스를 시작하지 못했습니다." });
    });
  } catch (error) {
    console.error("[verifyTranslationQa] Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
