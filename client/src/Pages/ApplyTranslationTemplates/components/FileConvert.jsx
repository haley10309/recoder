import React from "react";
import styled from "styled-components";

import FileConvertButtons from "./FileConvertButtons";
import PreviewPanel from "./PreviewPanel";

const FileConvert = ({
  ticketNum,
  ticketUrl,
  isEnglishCountry,
  fileName,
  handleApplyLocalization,
  handleLocalizedDownload,
  localizationStatus,
  isLocalizationApplied,
  copyDeckFile,
}) => {

  if (!fileName) return null;

  return (
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
