import { useState } from "react";

export function useLocalizationApply({
  tobeHtmlContent,
  tobeHtmlFileName,
  textareas,
  setTextareas,
  translationMap,
  countOccurrences,
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

  // const handleConvertByCountryCode = async () => {
  //   const lowerCaseCode = countryCode?.toLowerCase?.() || "";

  //   const updatedTextareas = textareas.map((textarea) => ({
  //     ...textarea,
  //     pptNo: textarea.pptNo,
  //     asWasCode: textarea.asWasCode.replace(/\/uk\//g, `/${lowerCaseCode}/`),
  //     toBeCode: textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCode}/`),
  //     changed: textarea.asWasCode !== "",
  //   }));

  //   setTextareas(updatedTextareas);
  //   setIsExecuted(true);
  //   setUploadProgress(0);

  //   if (
  //     backupHtmlFile &&
  //     updatedTextareas.every(({ asWasCode, toBeCode }) => asWasCode && (toBeCode !== null || toBeCode === ""))
  //   ) {
  //     const formData = new FormData();
  //     formData.append("file", backupHtmlFile);

  //     const codeChanges = updatedTextareas
  //       .filter((textarea) => textarea.changed)
  //       .map((textarea) => ({
  //         asWasCode: textarea.asWasCode,
  //         toBeCode: textarea.toBeCode,
  //       }));
  //     formData.append("codeChanges", JSON.stringify(codeChanges));
  //     formData.append("ticket_url", String(ticketUrl));
  //     formData.append("countryCode", String(countryCode));

  //     try {
  //       const result = await convertAsWasToToBeCodes({
  //         formData,
  //         setIsProcessing,
  //         setUploadProgress,
  //       });

  //       if (result) {
  //         const { fileContent, filename, changeResults } = result;
  //         setDownloadedFileContent(fileContent);
  //         setDownloadedFileName(filename);
  //         setUploadStatus("success");

  //         setTextareas(updatedTextareas);
  //         handleChangeResults(changeResults);
  //       } else {
  //         setUploadStatus("fail");
  //       }
  //     } catch (error) {
  //       console.error("파일 실행 오류", error);
  //       setUploadStatus("fail");
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   } else {
  //     alert("파일 선택, asWasCode, toBeCode 입력은 필수입니다.");
  //   }
  // };

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

      // 전체 HTML 변환
      let localizedHtmlContent = tobeHtmlContent;

      updatedTextareas.forEach((textarea) => {
        const localizedTobeContext = _applyLocalizedTemplateBlocks(
          textarea.toBeCode,
          translationMap,
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
