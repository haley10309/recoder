// 사용중, PPT -> word -> txt 처리한 가이드용
// 가이드 업로드 후, 처리 로직

import { Request, Response } from "express";
import { GuideUploadResponse } from "../../types/codeTemplate.types";

export const parseGuideFile = async (
  req: Request<
    {},
    {},
    {
      asWasText: string;
      toBeText: string;
    }
    >,
  res: Response<GuideUploadResponse>
): Promise<void> => {
  const { asWasText, toBeText } = req.body;

  if (!asWasText || !toBeText) {
    res.status(400).json({ error: "asWasText / toBeText가 필요합니다." });
    return;
  }

  const pptNos: string[] = [];
  const asWasCodes: string[] = [];
  const toBeCodes: string[] = [];
  
  // 슬라이드 단위 분리
  const asWasSections = asWasText.split(/(?=슬라이드\s*\d+)/g);
  const toBeSections = toBeText.split(/(?=슬라이드\s*\d+)/g);
  const sectionMap = new Map<
    string,
    { asWasEntries: string[]; toBeEntries: string[] }
  >();

  asWasSections.forEach(section => {
    const slideMatch = section.match(/슬라이드\s*(\d+)/);
    if (!slideMatch) return;

    const slideNo = slideMatch[1];
    const entries = section
      .replace(/슬라이드\s*\d+/g, "")
      .split(/-{3,}|(?:\r?\n\s*\r?\n\s*\r?\n\s*\r?\n)/)
      .map(s => s.trim())
      .filter(Boolean);

    sectionMap.set(slideNo, {
      asWasEntries: entries,
      toBeEntries: [],
    });
  });

  toBeSections.forEach(section => {
    const slideMatch = section.match(/슬라이드\s*(\d+)/);
    if (!slideMatch) return;

    const slideNo = slideMatch[1];
    const entries = section
      .replace(/슬라이드\s*\d+/g, "")
      .replace(/-\n/g, "")
      .split(/-{3,}|(?:\r?\n\s*\r?\n\s*\r?\n\s*\r?\n)/)
      .map(s => s.trim())
      .filter(Boolean);

    const target = sectionMap.get(slideNo) ?? {
      asWasEntries: [],
      toBeEntries: [],
    };

    target.toBeEntries = entries;
    sectionMap.set(slideNo, target);
  });

  // 결과 정리 (슬라이드 기준)
  sectionMap.forEach((value, slideNo) => {
    const maxLen = Math.max(
      value.asWasEntries.length,
      value.toBeEntries.length
    );

    for (let i = 0; i < maxLen; i++) {
      pptNos.push(slideNo);
      asWasCodes.push(value.asWasEntries[i] ?? "");
      toBeCodes.push(value.toBeEntries[i] ?? "");
    }
  });
  // 응답 전송
  res.json({
    pptNos,
    asWasCodes,
    toBeCodes,
  });
};