import { fetchLocalizationList } from "@/apis/apis";
import { useState } from "react";

export function useLocalizationApply({
  tobeFileContent,
  fileName,
  textareas,
  setTextareas,
  countryCode,
  translationMap,
}) {
  const [localizedFileContent, setLocalizedFileContent] = useState("");
  const [localizedFileName, setLocalizedFileName] = useState("");
  const [isLocalizationApplied, setIsLocalizationApplied] = useState(false);
  const [localizationStatus, setLocalizationStatus] = useState("");

  /**
   * 템플릿 HTML에서 블록별로 영어 텍스트를 찾아서 국가 번역본으로 치환하는 함수
   */
  // const applyLocalizedTemplateBlocks = (
  //   originalTobeContext, // tobe에서 uk->sitecdoe 로 변환된 코드블록
  //   _translationMap, // key: english copy, value: country copy
  // ) => {
  //   let newTobeContext = originalTobeContext;
  //   let blockDoc = new DOMParser().parseFromString(
  //     newTobeContext,
  //     "text/html"
  //   ); // blockDoc : 블록 안 텍스트 비교를 위해 임시로 만든 DOM.
  //   let blockText = blockDoc.documentElement.textContent?.trim();


  //   Object.entries(_translationMap).forEach(([engCopy, localCopy]) => {
  //     const cleanedEng = engCopy.trim().replace(/\s+/g, " ");
  //     const cleanedBlockText = blockText?.replace(/\s+/g, " ");
  //     if (cleanedBlockText && cleanedBlockText.includes(cleanedEng)) {
  //       const regex = new RegExp(escapeRegExp(engCopy), "g");
  //       newTobeContext = newTobeContext.replace(regex, localCopy);
  //     }
  //   });

  //   return newTobeContext; // localized tobe context
  // };

  /**
   * LocalizationEntry에서 블록별로 영어 텍스트를 찾아서 각 국가 번역본으로 치환하는 함수
   */
  const applyLocalizedTemplateBlocks = (
    originalTobeContext,
    _translationMap,
    _localizationEntries
  ) => {
    let newTobeContext = originalTobeContext;
    _localizationEntries.forEach((item) => {
      const lowerCaseCountryCode = countryCode?.toLowerCase?.() || "";

      let originalBlock = item.code_context;
      let blockDoc = new DOMParser().parseFromString(
        originalBlock,
        "text/html"
      );
      let blockText = blockDoc.documentElement.textContent?.trim();

      Object.entries(_translationMap).forEach(([eng, local]) => {
        const cleanedEng = eng.trim().replace(/\s+/g, " ");
        const cleanedBlockText = blockText?.replace(/\s+/g, " ");
        if (cleanedBlockText && cleanedBlockText.includes(cleanedEng)) {
          const regex = new RegExp(escapeRegExp(eng), "g");
          originalBlock = originalBlock.replace(regex, local);
        }
      });

      const code_context__converted_to_country_code = item.code_context.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`);
      if (newTobeContext.includes(code_context__converted_to_country_code)) {
        const originalBlock_convertedByCountryCode = originalBlock.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`);
        newTobeContext = newTobeContext.replace(code_context__converted_to_country_code, originalBlock_convertedByCountryCode);
      }
    });

    return newTobeContext;
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const handleApplyLocalization = async ({ ticketNum, ticketUrl, hasCopyDeckFile }) => {
    try {
      if (!hasCopyDeckFile) {
        alert("번역덱 TXT 파일을 업로드 해야 로컬라이제이션을 적용할 수 있어요.");
        return;
      }

      const localizationEntries = await fetchLocalizationList(
        ticketNum,
        ticketUrl
      );

      const lowerCaseCountryCode = countryCode?.toLowerCase?.() || "";

      // textareas 업데이트 (tobe -> 번역 -> localized tobe)
      const updatedTextareas = textareas.map((textarea) => {
        const localizedToBe = applyLocalizedTemplateBlocks(
          textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
          translationMap,
          localizationEntries
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
      let localizedHtml = tobeFileContent;
      
      updatedTextareas.forEach((textarea) => {
        const localizedTobeContext = applyLocalizedTemplateBlocks(
          textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
          translationMap,
          localizationEntries
        );

        if (localizedHtml.includes(textarea.toBeCode)) {
          localizedHtml = localizedHtml.replace(textarea.toBeCode, localizedTobeContext);
        }
      });

      setLocalizedFileContent(localizedHtml);
      setLocalizedFileName(`localized_${fileName}`);
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
