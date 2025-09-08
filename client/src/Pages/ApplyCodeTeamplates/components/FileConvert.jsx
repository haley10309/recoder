import React, { useEffect, useState } from "react";
import styled from "styled-components";

import { useFileExecute } from "../hooks/useFileExecute";

import FileUploadSection from "./FileUploadSection";
import FileConvertButtons from "./FileConvertButtons";
import PreviewPanel from "./PreviewPanel";

const FileConvert = ({
  ticketUrl,
  textareas,
  setTextareas,
  countryCode,
  originalFile,
  fileContent,
  fileName,
  htmlUploadStatus,
  handleBackupFileUpload,
}) => {
  const [needToSaveTemplate, setNeedToSaveTemplate] = useState(false);

  // 코드 실행 훅
  const {
    isProcessing,
    isExecuted,
    uploadProgress,
    uploadStatus,
    downloadedFileContent,
    downloadedFileName,
    handleConvertByCountryCode,
  } = useFileExecute({
    originalFile,
    fileContent,
    textareas,
    setTextareas,
    countryCode,
    ticketUrl,
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

      setNeedToSaveTemplate(true);
    } else {
      alert("변환된 파일이 없습니다. 먼저 코드 변환을 진행해주세요.");
    }
  };

  useEffect(() => {
    if (needToSaveTemplate) {
      setTimeout(() => {
        setNeedToSaveTemplate(false);
      }, 5000);
    }
  }, [needToSaveTemplate]);

  return (
    <>
      <FileUploadSection
        fileName={fileName}
        htmlUploadStatus={htmlUploadStatus}
        handleBackupFileUpload={handleBackupFileUpload}
        countryCode={countryCode}
      />

      {!!fileName && (
        <FileConvertBottonBox>
          <FileConvertButtons
            countryCode={countryCode}
            fileName={fileName}
            isProcessing={isProcessing}
            handleConvertByCountryCode={handleConvertByCountryCode}
          />

          <PreviewPanel
            downloadedFileName={downloadedFileName}
            uploadProgress={uploadProgress}
            uploadStatus={uploadStatus}
            isExecuted={isExecuted}
            handleDownload={handleDownload}
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
