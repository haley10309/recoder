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
  
  const parseTaggedSections = (
    text: string,
    tag: "AS-WAS" | "TO-BE"
  ): { slideNo: string; content: string }[] => {
    const normalizedText = text.replace(/\r\n/g, "\n");

    const markerRegex = new RegExp(`슬라이드\\s*(\\d+)|\\[${tag}\\]`, "g");
    const markers: Array<
      | { type: "slide"; index: number; slideNo: string; raw: string }
      | { type: "tag"; index: number; raw: string }
    > = [];

    let match: RegExpExecArray | null;
    while ((match = markerRegex.exec(normalizedText)) !== null) {
      if (match[1]) {
        markers.push({
          type: "slide",
          index: match.index,
          slideNo: match[1],
          raw: match[0],
        });
      } else {
        markers.push({
          type: "tag",
          index: match.index,
          raw: match[0],
        });
      }
    }

    const results: { slideNo: string; content: string }[] = [];
    let currentSlideNo = "";

    for (let i = 0; i < markers.length; i++) {
      const marker = markers[i];

      if (marker.type === "slide") {
        currentSlideNo = marker.slideNo;
        continue;
      }

      if (marker.type === "tag") {
        if (!currentSlideNo) continue;

        const contentStart = marker.index + marker.raw.length;
        const contentEnd =
          i + 1 < markers.length ? markers[i + 1].index : normalizedText.length;

        const content = normalizedText.slice(contentStart, contentEnd).trim();
        if (!content) continue;

        const entries = content
          .replace(/슬라이드\s*\d+/g, "")
          .replace(tag === "TO-BE" ? /-\n/g : /$^/, "")
          .split(/-{3,}|(?:\n\s*\n\s*\n\s*\n)/)
          .map(s => s.trim())
          .filter(Boolean);

        results.push({
          slideNo: currentSlideNo,
          content: entries.join("\n"),
        });
      }
    }

    return results;
  };

  const asWasParsed = parseTaggedSections(asWasText, "AS-WAS");
  const toBeParsed = parseTaggedSections(toBeText, "TO-BE");

  for (const item of asWasParsed) {
    pptNos.push(item.slideNo);
    asWasCodes.push(item.content);
  }

  for (const item of toBeParsed) {
    toBeCodes.push(item.content);
  }
  
  // 응답 전송
  res.json({
    pptNos,
    asWasCodes,
    toBeCodes,
  });
};