import { useState } from "react";

import { convertAsWasToToBeCodes } from "@/apis/apis";

export function useLocalizationApply({
  tobeHtmlFile,
  tobeHtmlFileName,
  textareas,
  setTextareas,
  translationMap,
  englishCopyList,  
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
  
  function findMatchingEnglishCopies(originalTobeCode, englishList = []) {
    if (!originalTobeCode) return [];
    if (!Array.isArray(englishList)) return [];

    return englishList.filter((eng) => {
      const cleanedEng = eng.trim().replace(/\s+/g, " ");

      // 원본 HTML에서 공백 normalize하여 직접 비교
      const cleanedHtml = originalTobeCode.replace(/\s+/g, " ");

      return cleanedHtml.includes(cleanedEng);
    });
  }

  /**
   * LocalizationEntry에서 블록별로 영어 텍스트를 찾아서 각 국가 번역본으로 치환하는 함수
   */
  const _applyLocalizedTemplateBlocks = (
    originalTobeCode,
    _translationMap,
    selectedEnglishCopies = [],
  ) => {
    if (!originalTobeCode) return "";
    if (countOccurrences(originalTobeCode) !== 1) return "";

    let localizedTobeCode = originalTobeCode;

    let blockDoc = new DOMParser().parseFromString(localizedTobeCode, "text/html");

    // let blockText = blockDoc.documentElement.textContent?.trim(); // textContent만
    let blockText = getTextWithAttributes(blockDoc.documentElement); // (updated) textContent+속성값까지
   
    selectedEnglishCopies.forEach((copy) => {
      if (!copy || !_translationMap[copy]) return;

      const cleanedCopy = copy.trim().replace(/\s+/g, " ");
      const cleanedBlockText = blockText?.replace(/\s+/g, " ");

      if (cleanedBlockText && cleanedBlockText.includes(cleanedCopy)) {
        const local = _translationMap[copy];
        const regex = new RegExp(escapeRegExp(copy), "g");
        localizedTobeCode = localizedTobeCode.replace(regex, local);
      }
    });

    return localizedTobeCode;
  };

  const escapeRegExp = (string) => {
    if (!string || typeof string !== "string") return "";
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
        const matchingEnglishCopies = findMatchingEnglishCopies(
          textarea.toBeCode,
          englishCopyList
        );

        const selectedEnglishCopies =
          textarea.selectedEnglishCopies && textarea.selectedEnglishCopies.length > 0
            ? textarea.selectedEnglishCopies
            : matchingEnglishCopies;


        const localizedToBeCode = _applyLocalizedTemplateBlocks(
          textarea.toBeCode,
          translationMap,
          selectedEnglishCopies, 
        );

        const errorState = Object.keys(translationMap).some((key) => localizedToBeCode.includes(key));

        return {
          ...textarea,
          matchingEnglishCopies, 
          selectedEnglishCopies,
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
          setLocalizationStatus("fail");
        }
      } catch (error) {
        console.error("파일 실행 오류", error);
        setLocalizationStatus("fail");
      } finally {
        // setIsProcessing(false); // TODO: 필요시 함수 만들어서 적용
      }

    } catch (error) {
      console.error('[handleApplyLocalization] 에러 ', error);
      setLocalizationStatus("fail");
    }
  };

  const handleSelectEnglishCopies = (index, selectedValues) => {
    setTextareas(prev =>
      prev.map((ta, i) => {
        if (i !== index) return ta;

        // 다중 선택 업데이트
        const selectedEnglishCopies = selectedValues;

        // 번역 적용 (여러 개 모두)
        let localized = ta.toBeCode;

        selectedEnglishCopies.forEach(eng => {
          const translated = translationMap[eng];
          if (!translated) return;

          const regex = new RegExp(escapeRegExp(eng), "g");
          localized = localized.replace(regex, translated);
        });

        // 에러 여부
        const errorState = Object.keys(translationMap).some(key =>
          localized.includes(key)
        );

        return {
          ...ta,
          selectedEnglishCopies: selectedValues,
          localizedToBeCode: localized,
          errorState,
        };
      })
    );
  };


  
  // 로컬라이제이션 다운로드
  const handleLocalizedDownload = () => {
    // TODO: 적용 (번역이 적용되지 않은 항목 판단 필요)
    // const hasUnapplied = textareas.some(
    //   (textarea) => textarea.isApplied === "no"
    // );

    // if (hasUnapplied) {
    //   const proceed = window.confirm(
    //     "🚫 변환이 적용되지 않은 항목이 있습니다.\n그래도 다운로드 하시겠습니까?"
    //   );
    //   if (!proceed) return;
    // }

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
    handleSelectEnglishCopies,
    handleLocalizedDownload,
  };
}
