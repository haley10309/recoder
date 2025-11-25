import { useState } from "react";

import { fetchLocalizationList } from "@/apis/apis";

export function useLocalizationApply({
  tobeHtmlContent,
  tobeHtmlFileName,
  textareas,
  setTextareas,
  countryCode,
  translationMap,
}) {
  const [localizedHtmlContent, setLocalizedHtmlContent] = useState("");
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

  const handleApplyLocalization = async ({ ticketNum, ticketUrl, hasTranslationDeckTxtFile }) => {
    try {
      if (!hasTranslationDeckTxtFile) {
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
        const errorState = Object.keys(translationMap).some((key) => localizedToBe.includes(key));

        return {
          ...textarea,
          localizedToBeCode: localizedToBe,
          errorState,
        };
      });
      setTextareas(updatedTextareas);

      // 전체 HTML 변환
      let localizedHtmlContent = tobeHtmlContent;

      updatedTextareas.forEach((textarea) => {
        const localizedTobeContext = applyLocalizedTemplateBlocks(
          textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
          translationMap,
          localizationEntries
        );

        if (localizedHtmlContent.includes(textarea.toBeCode)) {
          localizedHtmlContent = localizedHtmlContent.replace(textarea.toBeCode, localizedTobeContext);
        }
      });

      setLocalizedHtmlContent(localizedHtmlContent);
      setLocalizedFileName(`localized_${tobeHtmlFileName}`);
      setIsLocalizationApplied(true);
      setLocalizationStatus("success");
    } catch (error) {
      console.error(error);
      setLocalizationStatus("fail");
    }
  };
  
  // 로컬라이제이션 다운로드
  const handleLocalizedDownload = () => {
    const hasUnapplied = textareas.some(
      (textarea) => textarea.isApplied === "no"
    );

    if (hasUnapplied) {
      const proceed = window.confirm(
        "🚫 변환이 적용되지 않은 항목이 있습니다.\n그래도 다운로드 하시겠습니까?"
      );
      if (!proceed) return;
    }

    if (localizedHtmlContent) {
      const blob = new Blob([localizedHtmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = localizedFileName || "localized_file.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("로컬라이제이션 적용을 먼저 진행해주세요.");
    }
  };
  
  return {
    isLocalizationApplied,
    localizationStatus,
    handleApplyLocalization,
    handleLocalizedDownload,
  };
}
