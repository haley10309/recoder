import React from "react";
import styled from "styled-components";

const PreviewPanel = ({
  // uploadStatus,
  localizationStatus,
  isLocalizationApplied,
  handleLocalizedDownload,
}) => {
  const getStatusText = () => {
    // if (uploadStatus === "success") {
    //   return "코드변환이 완료되어 파일이 생성되었습니다!";
    // } else if (uploadStatus === "fail") {
    //   return "파일 생성 실패";
    // }
    
    if (localizationStatus === "success") {
      return "로컬라이제이션 완료!";
    } else if (localizationStatus === "fail") {
      return "로컬라이제이션 실패";
    }
    return null;
  };

  return (
    <PreviewContainer>
      <div style={{marginRight: 20}}>{getStatusText()}</div>
      <PreviewCard>
        {isLocalizationApplied && (
          <LocalizationDownloadButton onClick={handleLocalizedDownload}>
            로컬라이제이션 적용본 다운로드
          </LocalizationDownloadButton>
        )}
      </PreviewCard>
    </PreviewContainer>
  );
};

export default PreviewPanel;

const PreviewContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;
const PreviewCard = styled.div`
  display: flex;
  gap: 0.8rem;
`;
const LocalizationDownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13.9375rem;
  height: 2.5625rem;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  background-color: #000000;
  border-radius: 10px;
`;
