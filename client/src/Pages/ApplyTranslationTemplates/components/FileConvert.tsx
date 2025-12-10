import React from "react";
import styled from "styled-components";

import FileConvertButtons from "./FileConvertButtons";
import PreviewPanel from "./PreviewPanel";

const FileConvert = ({
  isEnglishCountry,
  tobeHtmlFileName,
  handleApplyLocalization,
  handleLocalizedDownload,
  localizationStatus,
  isLocalizationApplied,
}) => {
  if (!tobeHtmlFileName) return null;

  return (
    <FileConvertBottonBox>
      <FileConvertButtons
        tobeHtmlFileName={tobeHtmlFileName}
        isEnglishCountry={isEnglishCountry}
        handleApplyLocalization={handleApplyLocalization}
      />
      <PreviewPanel
        localizationStatus={localizationStatus}
        isLocalizationApplied={isLocalizationApplied}
        handleLocalizedDownload={handleLocalizedDownload}
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
