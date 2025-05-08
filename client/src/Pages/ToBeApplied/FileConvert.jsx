import React from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import {
  countryCodeState,
  ticketUrlState,
  ticketNumState,
  isEnglishCountryState,
} from "@/recoil/atoms/state";

import { useFileUpload } from "@/hooks/ToBeApplied/useFileUpload";
import { useTranslationUpload } from "@/hooks/ToBeApplied/useTranslationUpload";
import { useFileExecute } from "@/hooks/ToBeApplied/useFileExecute";
import { useLocalizationApply } from "@/hooks/ToBeApplied/useLocalizationApply";

import FileUploadSection from "@/Components/ToBeApplied/FileUploadSection";
import FileConvertButtons from "@/Components/ToBeApplied/FileConvertButtons";
import PreviewPanel from "@/Components/ToBeApplied/PreviewPanel";

const FileConvert = ({ textareas, setTextareas }) => {
  const country_code = useRecoilValue(countryCodeState);
  const ticketUrl = useRecoilValue(ticketUrlState);
  const ticketNum = useRecoilValue(ticketNumState);
  const isEnglishCountry = useRecoilValue(isEnglishCountryState);

  // HTML 파일 업로드 훅
  const {
    originalFile,
    fileContent,
    fileName,
    htmlUploadStatus,
    handleFileChange,
  } = useFileUpload();

  // 번역덱 업로드 훅
  const {
    currentTranslations,
    txtUploadStatus,
    txtFileName,
    txtUploadProgress,
    handleTranslationUpload,
  } = useTranslationUpload(country_code);

  // 코드 실행 훅
  const {
    isProcessing,
    isExecuted,
    uploadProgress,
    uploadStatus,
    downloadedFileContent,
    downloadedFileName,
    handleExecute,
  } = useFileExecute({
    originalFile,
    fileContent,
    textareas,
    setTextareas,
    country_code,
    ticketUrl,
  });

  // 로컬라이제이션 적용 훅
  const {
    localizedFileContent,
    localizedFileName,
    isLocalizationApplied,
    localizationStatus,
    handleApplyLocalization,
  } = useLocalizationApply({
    downloadedFileContent,
    fileName,
    setTextareas,
    country_code,
    currentTranslations,
  });

  // 코드 변환 다운로드
  const handleDownload = () => {
    const hasUnapplied = textareas.some(
      (textarea) => textarea.isApplied === "no"
    );

    if (hasUnapplied) {
      const proceed = window.confirm(
        "🚫 변환이 적용되지 않은 항목이 있습니다.\n그래도 다운로드 하시겠습니까?"
      );
      if (!proceed) return;
    }

    if (downloadedFileContent) {
      const blob = new Blob([downloadedFileContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadedFileName || "downloaded_file.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("변환된 파일이 없습니다. 먼저 코드 변환을 진행해주세요.");
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
        handleFileChange={handleFileChange}
        isEnglishCountry={isEnglishCountry}
        txtUploadStatus={txtUploadStatus}
        txtFileName={txtFileName}
        handleTranslationUpload={handleTranslationUpload}
      />

      {fileName && (
        <>
          <FileConvertBottonBox>
            <FileConvertButtons
              fileName={fileName}
              isProcessing={isProcessing}
              handleExecute={handleExecute}
              isEnglishCountry={isEnglishCountry}
              handleApplyLocalization={handleApplyLocalization}
              ticketNum={ticketNum}
              ticketUrl={ticketUrl}
            />

            <PreviewPanel
              downloadedFileName={downloadedFileName}
              uploadProgress={uploadProgress}
              uploadStatus={uploadStatus}
              localizationStatus={localizationStatus}
              isExecuted={isExecuted}
              isLocalizationApplied={isLocalizationApplied}
              handleDownload={handleDownload}
              handleLocalizedDownload={handleLocalizedDownload}
            />
          </FileConvertBottonBox>
        </>
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