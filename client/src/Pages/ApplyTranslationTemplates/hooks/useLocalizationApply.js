import { useState } from "react";

import { convertAsWasToToBeCodes } from "@/apis/apis";

export function useLocalizationApply({
  tobeHtmlFile,
  tobeHtmlFileName,
  textareas,
  setTextareas,
  translationMap,
  countOccurrences,
  ticketUrl,
  countryCode,
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
  const _applyLocalizedTemplateBlocks = (
    originalTobeCode,
    _translationMap,
  ) => {
    if (!originalTobeCode) return "";
    if (countOccurrences(originalTobeCode) !== 1) return "";

    let localizedTobeCode = originalTobeCode;

    let blockDoc = new DOMParser().parseFromString(
      localizedTobeCode,
      "text/html"
    );
    // let blockText = blockDoc.documentElement.textContent?.trim(); // textContent만
    let blockText = getTextWithAttributes(blockDoc.documentElement); // (updated) textContent+속성값까지

    Object.entries(_translationMap).forEach(([eng, local]) => {
      const cleanedEng = eng.trim().replace(/\s+/g, " ");
      const cleanedBlockText = blockText?.replace(/\s+/g, " ");
      if (cleanedBlockText && cleanedBlockText.includes(cleanedEng)) {
        const regex = new RegExp(escapeRegExp(eng), "g");
        localizedTobeCode = localizedTobeCode.replace(regex, local);
      }
    });

    return localizedTobeCode;
  };

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const handleApplyLocalization = async ({ hasTranslationDeckTxtFile }) => {
    try {
      if (!hasTranslationDeckTxtFile) {
        alert("번역덱 TXT 파일을 업로드 해야 로컬라이제이션을 적용할 수 있어요.");
        return;
      }

      // textareas 업데이트 (tobe -> 번역 -> localized tobe)
      const updatedTextareas = textareas.map((textarea) => {
        const localizedToBeCode = _applyLocalizedTemplateBlocks(
          textarea.toBeCode,
          translationMap,
        );
        const errorState = Object.keys(translationMap).some((key) => localizedToBeCode.includes(key));

        return {
          ...textarea,
          localizedToBeCode,
          errorState,
        };
      });
      setTextareas(updatedTextareas);

      if (!tobeHtmlFile) {
        alert("To-BE Html 파일을 업로드 해야 로컬라이제이션이 가능해요.");
        return;
      }
      
      const formData = new FormData();
      formData.append("file", tobeHtmlFile);

      const codeChanges = updatedTextareas
        .filter((textarea) => textarea.toBeCode && textarea.localizedToBeCode)
        .map((textarea) => ({
          // api에서는 asWasCode와 toBeCode 이름으로 input 받고있음
          asWasCode: textarea.toBeCode,
          toBeCode: textarea.localizedToBeCode,
        }));
      formData.append("codeChanges", JSON.stringify(codeChanges));
      formData.append("ticket_url", String(ticketUrl));
      formData.append("countryCode", String(countryCode));

      try {
        const result = await convertAsWasToToBeCodes({
          formData,
          setIsProcessing: () => {}, // TODO: 필요시 함수 만들어서 적용
          setUploadProgress: () => {}, // TODO: 필요시 함수 만들어서 적용
        });

        if (result) {
          const { fileContent, filename, changeResults } = result;
          setLocalizedHtmlContent(fileContent);
          setLocalizedFileName(`localized_${tobeHtmlFileName}`);
          setIsLocalizationApplied(true);
          setLocalizationStatus("success");
        } else {
          setUploadStatus("fail");
        }
      } catch (error) {
        console.error("파일 실행 오류", error);
        setUploadStatus("fail");
      } finally {
        // setIsProcessing(false); // TODO: 필요시 함수 만들어서 적용
      }

    } catch (error) {
      console.error('[handleApplyLocalization] 에러 ', error);
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
