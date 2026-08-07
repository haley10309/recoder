import { Request, Response } from "express";
import { stripDisclaimerNumber, wrapRegSymbol  } from "../../utils/copyTransform";
import { ProcessCopyBody, ProcessCopyResponse, UnpackRow } from "../../types/unpack.types";

// true 값이 문자열인가 true 인가.
const isTrue = (value: unknown): boolean => {
  if (typeof value === "string") {
    return ["true", "o", "O"].includes(value.trim());
  }

  return value === true;
};

const processTranslatedCopy = (row: UnpackRow): string => {
  const copy = row.translated_copy ?? "";

  // Disclaimer 영역의 ® 변환은 구조적 요구사항이므로
  // enable_text_transform 플래그와 무관하게 적용한다
  if (row.apply_type === "text_disclaimer") {
    const converted = wrapRegSymbol(copy);

    return isTrue(row.enable_text_transform)
      ? converted.replace(/^\d+\.\s*/, "").trim()   // 앞 번호 제거
      : converted;
  }

  if (!isTrue(row.enable_text_transform)) return copy;

  // innerText → 카피 끝의 디스클레이머 번호 제거
  if (row.apply_type === "innerText") {
    return stripDisclaimerNumber(copy);
  }

  return copy;
};

export const processCopy = async (
  req: Request<{}, {}, ProcessCopyBody>,
  res: Response<ProcessCopyResponse>
): Promise<void> => {
  const { row_list } = req.body;

  try {
    if (!row_list || !Array.isArray(row_list)) {
      res.status(400).json({ success: false, error: "row_list is required." });
      return;
    }

    const processed_row_list: UnpackRow[] = row_list.map((row) => ({
      ...row,
      processed_translated_copy: processTranslatedCopy(row),
    }));

    res.json({ success: true, row_list: processed_row_list });
  } catch (err) {
    console.error("Error processing copy:", err);
    res.status(500).json({ success: false, error: "Failed to process copy" });
  }
};