// 사용중, PPT -> word -> txt 처리한 가이드용
// 가이드 업로드 후, 처리 로직

import { Request, Response } from "express";
import { GuideUploadResponse } from "../../types/codeTemplate.types";


export const parseGuideFile = async (
  req: Request,
  res: Response<GuideUploadResponse>
): Promise<void> => {

  const asWasFile = (req.files as any)?.["asWasFile"]?.[0];
  const toBeFile = (req.files as any)?.["toBeFile"]?.[0];

  if (!asWasFile || !toBeFile) {
  res.status(400).json({ error: "asWasFile/toBeFile이 필요합니다." });
  return;
  }
  
  const asWasText = asWasFile.buffer.toString("utf-8");
  const toBeText = toBeFile.buffer.toString("utf-8");
  
  const pptNos: string[] = [];
  const asWasCodes: string[] = [];
  const toBeCodes: string[] = [];
  
  // 슬라이드 단위 분리
  const asWasSections: string[] = asWasText.split(/(?=슬라이드\s*\d+)/g);
  const toBeSections: string[] = toBeText.split(/(?=슬라이드\s*\d+)/g);
  const sectionMap = new Map<
    string,
    { asWasEntries: string[]; toBeEntries: string[] }
  >();

  asWasSections.forEach(section => {

    const m = section.match(/슬라이드\s*(\d+)/);
    const slideNo = m?.[1];          // slideNo: string | undefined
    if (!slideNo) return;

    const matches = [...section.matchAll(/^\[AS-WAS\][\r\n]*([\s\S]*?)(?=^\[AS-WAS\]|(?![\s\S]))/gm)];
    if (matches.length === 0) return;

    // 여러 AS-WAS 블록을 entries로 합치기(원하면 블록별 분리도 가능)
    const entries = matches
      .map(m => m[1].trim())
      .flatMap(block =>
        block
          .replace(/슬라이드\s*\d+/g, "")
          .split(/-{3,}|(?:\r?\n\s*\r?\n\s*\r?\n\s*\r?\n)/)
          .map(s => s.trim())
          .filter(Boolean)
      );

    const target = sectionMap.get(slideNo) ?? { asWasEntries: [], toBeEntries: [] };
    target.asWasEntries = entries;
    sectionMap.set(slideNo, target);
  });

  toBeSections.forEach(section => {
    const m = section.match(/슬라이드\s*(\d+)/);
    const slideNo = m?.[1];          // slideNo: string | undefined
    if (!slideNo) return;

    const matches = [...section.matchAll(/^\[TO-BE\][\r\n]*([\s\S]*?)(?=^\[AS-WAS\]|(?![\s\S]))/gm)];
    if (matches.length === 0) return;

    const entries = matches
      .map(m => m[1].trim())
      .flatMap(block =>
        block
          .replace(/슬라이드\s*\d+/g, "")
          .replace(/-\n/g, "")
          .split(/-{3,}|(?:\r?\n\s*\r?\n\s*\r?\n\s*\r?\n)/)
          .map(s => s.trim())
          .filter(Boolean)
      );

    const target = sectionMap.get(slideNo) ?? { asWasEntries: [], toBeEntries: [] };
    target.toBeEntries = entries;
    sectionMap.set(slideNo, target);
  });

  for (const [slideNo, v] of sectionMap.entries()) {
    pptNos.push(slideNo);
    asWasCodes.push(v.asWasEntries.join("\n"));
    toBeCodes.push(v.toBeEntries.join("\n"));
  }
  
  // 응답 전송
  res.json({
    pptNos,
    asWasCodes,
    toBeCodes,
  });
};