import { useState } from "react";

import { fetchLocalizationList } from "@/apis/apis";

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

  function getTextWithAttributes(node) {
    let texts = [];

    // 1. 현재 노드의 텍스트
    if (node.textContent?.trim()) {
      texts.push(node.textContent.trim());
    }

    // 2. 현재 노드의 속성값들
    if (node.attributes) {
      for (let attr of node.attributes) {
        if (attr.value?.trim()) {
          texts.push(attr.value.trim());
        }
      }
    }

    // 3. 자식 노드 재귀 처리
    for (let child of node.children || []) {
      texts.push(getTextWithAttributes(child));
    }

    return texts.join("\n");
  }

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
      // let blockText = blockDoc.documentElement.textContent?.trim(); // textContent만
      let blockText = getTextWithAttributes(blockDoc.documentElement); // textContent+속성값까지

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
          textarea.toBeCode,
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
