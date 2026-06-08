import { useState } from "react";

import { convertAsWasToToBeCodes, applyLocalization} from "@/apis/apis";

export function useLocalizationApply({
  tobeHtmlFile,
  tobeHtmlFileName,
  textareas,
  setTextareas,
  translationMap,
  englishCopyList,  
  ticketUrl,
  countryCode,
}) {
  const [localizedHtmlContent, setLocalizedHtmlContent] = useState("");
  const [localizedFileName, setLocalizedFileName] = useState("");
  const [isLocalizationApplied, setIsLocalizationApplied] = useState(false);
  const [localizationStatus, setLocalizationStatus] = useState("");

  const handleApplyLocalization = async ({ hasTranslationDeckTxtFile }) => {
    try {
      if (!hasTranslationDeckTxtFile) {
        alert("번역덱 TXT 파일을 업로드 해야 로컬라이제이션을 적용할 수 있어요.");
        return;
      }

      if (!tobeHtmlFile) {
        alert("To-BE Html 파일을 업로드 해야 로컬라이제이션이 가능해요.");
        return;
      }

      /**
       * 1. 서버에서 로컬라이제이션 치환 처리
       */
      const localizationFormData = new FormData();
      localizationFormData.append("file", tobeHtmlFile);
      localizationFormData.append("textareas", JSON.stringify(textareas));
      localizationFormData.append("translationMap", JSON.stringify(translationMap));
      localizationFormData.append("englishCopyList", JSON.stringify(englishCopyList));

      const localizationResult = await applyLocalization({
        formData: localizationFormData,
      });

      if (!localizationResult?.success) {
        setLocalizationStatus("fail");
        alert(localizationResult?.error || "로컬라이제이션 적용 중 오류가 발생했습니다.");
        return;
      }

      const updatedTextareas = localizationResult.updatedTextareas || [];

      /**
       * 2. 서버 응답을 화면 textarea 상태에 반영
       */
      setTextareas(updatedTextareas);

      /**
       * 3. localizedToBeCode 기준으로 HTML 치환 API 호출
       */
      const convertFormData = new FormData();
      convertFormData.append("file", tobeHtmlFile);

      const codeChanges = updatedTextareas
        .filter((textarea) => textarea.toBeCode && textarea.localizedToBeCode)
        .map((textarea) => ({
          asWasCode: textarea.toBeCode,
          toBeCode: textarea.localizedToBeCode,
        }));

      convertFormData.append("codeChanges", JSON.stringify(codeChanges));
      convertFormData.append("ticket_url", String(ticketUrl));
      convertFormData.append("countryCode", String(countryCode));

      const result = await convertAsWasToToBeCodes({
        formData: convertFormData,
        setIsProcessing: () => {},
        setUploadProgress: () => {},
      });

      if (result) {
        const { fileContent } = result;

        setLocalizedHtmlContent(fileContent);
        setLocalizedFileName(`localized_${tobeHtmlFileName}`);
        setIsLocalizationApplied(true);
        setLocalizationStatus("success");
      } else {
        setLocalizationStatus("fail");
      }
    } catch (error) {
      console.error("[handleApplyLocalization] 에러", error);
      setLocalizationStatus("fail");
    }
  };

  const handleSelectEnglishCopies = (index, selectedValues) => {
    setTextareas((prev) =>
      prev.map((ta, i) => {
        if (i !== index) return ta;

        return {
          ...ta,
          selectedEnglishCopies: selectedValues,
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
