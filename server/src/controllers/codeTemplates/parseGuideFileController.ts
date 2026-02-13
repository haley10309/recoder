// 사용중, PPT -> word -> txt 처리한 가이드용
// 가이드 업로드 후, 처리 로직

import { Request, Response } from "express";
import { GuideUploadResponse } from "../../types/codeTemplate.types";

export const parseGuideFile = async (
  req: Request,
  res: Response<GuideUploadResponse>
): Promise<void> => {
  // TODO: 나눠서 보내지말고 하나로 보내고 클라이언트에서도 그렇게 한방에 처리하기
  if (!req.file) {
    res.status(400).json({ error: "파일이 업로드되지 않았습니다." });
    return;
  }

  const text = req.file.buffer.toString('utf-8');
  
  const slideSections = text.split(/(?=슬라이드\s*\d+\s*\[AS-WAS\])/g); // 슬라이드별로 분리

  const pptNos: string[] = [];
  const asWasCodes: string[] = [];
  const toBeCodes: string[] = [];

  slideSections.forEach(section => {
    const slideNoMatch = section.match(/슬라이드\s*(\d+)/);
    if (!slideNoMatch) return; // 슬라이드 번호가 없으면 건너뜀
    const slideNo = slideNoMatch[1];

    // AS-WAS ~ TO-BE 추출
    const asWasMatch = section.match(/\[AS-WAS\]([\s\S]*?)\[TO-BE\]/);
    const toBeMatch = section.match(/\[TO-BE\]([\s\S]*?)(?=슬라이드|$)/); 

    let asWasEntries: string[] = [];
    let toBeEntries: string[] = [];

    // AS-WAS 처리
    if (asWasMatch) {
      let asWasText = asWasMatch[1].trim();
      // asWasEntries = asWasText.split(/\n\s*\n\s*\n/).map(s => s.trim()).filter(Boolean);
      asWasEntries = asWasText.split(/-{3,}|(?:\r?\n\s*\r?\n\s*\r?\n\s*\r?\n\s*\r?\n)/).map(s => s.trim()).filter(Boolean);
    }

    // TO-BE 처리
    if (toBeMatch) {
      let toBeText = toBeMatch[1]
        .replace(/-\n/g, '') // `-`로 끝나는 줄은 이어 붙이기
        .trim();
      // toBeEntries = toBeText.split(/\n\s*\n\s*\n/).map(s => s.trim()).filter(Boolean);
      toBeEntries = toBeText.split(/-{3,}|(?:\r?\n\s*\r?\n\s*\r?\n\s*\r?\n\s*\r?\n)/).map(s => s.trim()).filter(Boolean);
   
      (/\r?\n\s*\r?\n\s*\r?\n\s*\r?\n/)
   }

    // 길이가 다르면 빈 항목 추가
    const maxLen = Math.max(asWasEntries.length, toBeEntries.length);
    if (asWasEntries.length < maxLen) {
      asWasEntries = [...asWasEntries, ...Array(maxLen - asWasEntries.length).fill("")];
    }
    if (toBeEntries.length < maxLen) {
      toBeEntries = [...toBeEntries, ...Array(maxLen - toBeEntries.length).fill("")];
    }

    // 각 항목에 대해 슬라이드 번호 추가
    pptNos.push(...Array(maxLen).fill(slideNo));
    asWasCodes.push(...asWasEntries);
    toBeCodes.push(...toBeEntries);
  });

  // 응답 전송
  res.json({
    pptNos,
    asWasCodes,
    toBeCodes,
  });
};