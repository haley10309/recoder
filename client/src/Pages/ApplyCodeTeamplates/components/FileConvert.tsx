import React from "react";
import styled from "styled-components";

import FileConvertButtons from "./FileConvertButtons";
import PreviewPanel from "./PreviewPanel";

const FileConvert = ({
  countryCode,
  fileName,
  isProcessing,
  isExecuted,
  uploadProgress,
  uploadStatus,
  downloadedFileName,
  handleConvertByCountryCode,
  handleDownload,
}) => {
  if (!fileName) return null;

  return (
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
  );
};

export default FileConvert;

const FileConvertBottonBox = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
`;
