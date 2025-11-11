import React from "react";
import styled from "styled-components";

import FileUploadSection from "./FileUploadSection";
import FileConvertButtons from "./FileConvertButtons";
import PreviewPanel from "./PreviewPanel";

import { useTranslationUpload } from "../hooks/useTranslationUpload";
import { useFileExecute } from "../hooks/useFileExecute";
import { useLocalizationApply } from "../hooks/useLocalizationApply";

const FileConvert = ({
  ticketNum,
  ticketUrl,
  textareas,
  setTextareas,
  countryCode,
  isEnglishCountry,
  originalFile,
  tobeFileContent,
  fileName,
  htmlUploadStatus,
  handleBackupFileUpload,
}) => {
  // 번역덱 업로드 훅
  const {
    copyDeckFile,
    translationMap,
    txtUploadStatus,
    txtFileName,
    handleTranslationTxtUpload,
  } = useTranslationUpload(countryCode);

  // 코드 실행 훅
  const {
    // uploadStatus,
  } = useFileExecute({
    // originalFile,
    // fileContent: tobeFileContent,
    // textareas,
    // setTextareas,
    // countryCode,
    // ticketUrl,
  });

  // 로컬라이제이션 적용 훅
  const {
    localizedFileContent,
    localizedFileName,
    isLocalizationApplied,
    localizationStatus,
    handleApplyLocalization,
  } = useLocalizationApply({
    tobeFileContent,
    fileName,
    textareas,
    setTextareas,
    countryCode,
    translationMap,
  });

  // 코드 변환 다운로드
  // const handleDownload = () => {
  //   const hasUnapplied = textareas.some(
  //     (textarea) => textarea.isApplied === "no"
  //   );

  //   if (hasUnapplied) {
  //     const proceed = window.confirm(
  //       "🚫 변환이 적용되지 않은 항목이 있습니다.\n그래도 다운로드 하시겠습니까?"
  //     );
  //     if (!proceed) return;
  //   }

  //   if (downloadedFileContent) {
  //     const blob = new Blob([downloadedFileContent], { type: "text/html" });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = downloadedFileName || "downloaded_file.html";
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //   } else {
  //     alert("변환된 파일이 없습니다. 먼저 코드 변환을 진행해주세요.");
  //   }
  // };

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

    if (localizedFileContent) {
      const blob = new Blob([localizedFileContent], { type: "text/html" });
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

  return (
    <>
      <FileUploadSection
        fileName={fileName}
        htmlUploadStatus={htmlUploadStatus}
        handleBackupFileUpload={handleBackupFileUpload}
        isEnglishCountry={isEnglishCountry}
        txtUploadStatus={txtUploadStatus}
        txtFileName={txtFileName}
        countryCode={countryCode}
        handleTranslationTxtUpload={handleTranslationTxtUpload}
      />

      {!!fileName && (
        <FileConvertBottonBox>
          <FileConvertButtons
            fileName={fileName}
            isEnglishCountry={isEnglishCountry}
            handleApplyLocalization={() => handleApplyLocalization({
              ticketNum,
              ticketUrl,
              hasCopyDeckFile: !!copyDeckFile,
            })}
          />

          <PreviewPanel
            // uploadStatus={uploadStatus}
            localizationStatus={localizationStatus}
            isLocalizationApplied={isLocalizationApplied}
            handleLocalizedDownload={handleLocalizedDownload}
          />
        </FileConvertBottonBox>
      )}
    </>
  );
};

export default FileConvert;

const FileConvertBottonBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`;
