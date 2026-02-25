// apply template 실행 기능
import { Request, Response } from "express";
import { replaceCode } from "../../utils/codeUtils";
import { ChangeResult, CodeChangePair, ConvertCodesBody, ConvertCodesResponse } from "../../types/codeTemplate.types";

/**
 * 현재 시간을 KST 기준으로 yyMMddHHmmss 형식으로 반환
 */
const formatDateToKST = () => {
  const now = new Date();

  // UTC 시간 기준에서 KST(+9시간)으로 오프셋
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const kstTime = new Date(utc + 9 * 60 * 60 * 1000);

  const yy = String(kstTime.getFullYear()).slice(2);
  const MM = String(kstTime.getMonth() + 1).padStart(2, "0");
  const dd = String(kstTime.getDate()).padStart(2, "0");
  const HH = String(kstTime.getHours()).padStart(2, "0");
  const mm = String(kstTime.getMinutes()).padStart(2, "0");
  const ss = String(kstTime.getSeconds()).padStart(2, "0");

  return `${yy}${MM}${dd}_${HH}${mm}${ss}`;
}

export const convertAsWasToToBeCodes = (
  req: Request<{}, {}, ConvertCodesBody>,
  res: Response<ConvertCodesResponse>
): void => {
  const { ticket_url, countryCode } = req.body;
  let parsedCodeChanges: CodeChangePair[] = JSON.parse(req.body.codeChanges);
  
  if (!req.file || !parsedCodeChanges || parsedCodeChanges.length === 0 || !ticket_url || !countryCode) {
    res.status(400).json({
      success: false,
      message: "File, code pairs, product name, and country code are required.",
    });
    return;
  }

  try {
    let originalCode = req.file.buffer.toString('utf-8');
    const changeResults: ChangeResult[] = [];

    parsedCodeChanges.forEach(({ asWasCode, toBeCode,variations}, index) => {

      // 각 국가에 따른 Variation
      const matched = variations?.find(v => v.countries?.includes(countryCode));
      const effectiveAsWas = matched?.aswas_code_variation ?? asWasCode;
      const effectiveToBe  = matched?.tobe_code_variation  ?? toBeCode;
      
      const { newCode, changed, matchedPart } = replaceCode(originalCode, effectiveAsWas, effectiveToBe);
      changeResults.push({ pairIndex: index, changed: !!changed, matchedPart });
      if (changed) {
        originalCode = newCode;
      }
    });

    const validCountryCode = (typeof countryCode === 'string') ? countryCode : '';

    const buffer = Buffer.from(originalCode, 'utf-8');
    const formattedDateStr = formatDateToKST()
    
    const formattedCountryCode = String(validCountryCode);
    const formattedticket_url = String(ticket_url).replaceAll("/", "_");
    const filename = `${formattedticket_url}_${formattedCountryCode}_tobe_${formattedDateStr}.html`;
    const encodedFilename = encodeURIComponent(filename);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedFilename}"`);

    res.json({
      success: true,
      changeResults,
      filename: encodedFilename,
      fileContent: buffer.toString('utf-8')
    });

  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({
      success: false,
      message: "Error processing file.",
    });
    return;
  }
};