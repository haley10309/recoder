import { useState } from "react";

import { formatDateToKST } from "@/utils/codeUtils";

export function useLocalizationApply({
  downloadedFileContent, // 국가코드, tobe로의 변환이 완료된 파일 content
  fileName,
  textareas,
  setTextareas,
  countryCode,
  translationMap,
  ticketNum,
}) {
  const [localizedFileContent, setLocalizedFileContent] = useState("");
  const [localizedFileName, setLocalizedFileName] = useState("");
  const [isLocalizationApplied, setIsLocalizationApplied] = useState(false);
  const [localizationStatus, setLocalizationStatus] = useState("");

  /**
   * 템플릿 HTML에서 블록별로 영어 텍스트를 찾아서 국가 번역본으로 치환하는 함수
   */
  const applyLocalizedTemplateBlocks = (
    originalTobeContext, // tobe에서 uk->sitecdoe 로 변환된 코드블록
    _translationMap, // key: english copy, value: country copy
  ) => {
    let newTobeContext = originalTobeContext;

    let blockDoc = new DOMParser().parseFromString(
      newTobeContext,
      "text/html"
    ); // blockDoc : 블록 안 텍스트 비교를 위해 임시로 만든 DOM.
    let blockText = blockDoc.documentElement.textContent?.trim();

    Object.entries(_translationMap).forEach(([engCopy, localCopy]) => {
      const cleanedEng = engCopy.trim().replace(/\s+/g, " ");
      const cleanedBlockText = blockText?.replace(/\s+/g, " ");
      if (cleanedBlockText && cleanedBlockText.includes(cleanedEng)) {
        const regex = new RegExp(escapeRegExp(engCopy), "g");
        newTobeContext = newTobeContext.replace(regex, localCopy);
      }
    });

    return newTobeContext; // localized tobe context
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const handleApplyLocalization = async (ticketNum, ticketUrl) => {
    try {

      const lowerCaseCountryCode = countryCode?.toLowerCase?.() || "";

      // textareas 업데이트하는 로직
      const updatedTextareas = textareas.map((textarea) => {
        const localizedToBe = applyLocalizedTemplateBlocks(
          textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
          translationMap,
        );
        
        const errorState = Object.keys(translationMap).some((key) => {
          return localizedToBe.includes(key);
        });

        return {
          ...textarea,
          localizedToBeCode: localizedToBe,
          errorState,
        };
      });
      setTextareas(updatedTextareas);

      // 전체 HTML 변환
      let localizedHtml = downloadedFileContent;
      
      updatedTextareas.forEach((textarea) => {
        const localizedTobeContext = applyLocalizedTemplateBlocks(textarea.toBeCode, translationMap)
        if (localizedHtml.includes(textarea.toBeCode)) {
          localizedHtml = localizedHtml.replace(textarea.toBeCode, localizedTobeContext);
        }
      });

      const formattedDate = formatDateToKST();

      setLocalizedFileContent(localizedHtml);
      setLocalizedFileName(`${ticketNum}_${countryCode.toUpperCase()}_localized_tobe_${formattedDate}`);
      setIsLocalizationApplied(true);
      setLocalizationStatus("success");
    } catch (error) {
      console.error(error);
      setLocalizationStatus("fail");
    }
  };

  return {
    localizedFileContent,
    localizedFileName,
    isLocalizationApplied,
    localizationStatus,
    handleApplyLocalization,
  };
}
