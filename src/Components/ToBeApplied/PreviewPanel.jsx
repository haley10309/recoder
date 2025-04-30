import React from "react";
import styled from "styled-components";
import HtmlFileIcon from "@/assets/union.svg";

const PreviewPanel = ({
  downloadedFileName,
  uploadProgress,
  uploadStatus,
  localizationStatus,
  isExecuted,
  isLocalizationApplied,
  handleDownload,
  handleLocalizedDownload,
}) => {
  const getStatusText = () => {
    if (uploadStatus === "success") {
      return "핫픽스 작업이 완료된 파일이 생성되었습니다!";
    } else if (uploadStatus === "fail") {
      return "파일 생성 실패";
    } else if (localizationStatus === "success") {
      return "로컬라이제이션 완료!";
    } else if (localizationStatus === "fail") {
      return "로컬라이제이션 실패";
    }
    return null;
  };

  return (
    <PreviewContainer>
      <PreviewCard>
        <PreviewHeader>
          <img src={HtmlFileIcon} alt="HTML icon" />
          <div id="preview-text">
            <FileName>{downloadedFileName}</FileName>
            <ProgressBar>
              <ProgressFill $progress={uploadProgress} />
            </ProgressBar>
            {(uploadStatus || localizationStatus) && (
              <UploadStatus
                $success={
                  uploadStatus === "success" || localizationStatus === "success"
                }
              >
                {getStatusText()}
              </UploadStatus>
            )}
          </div>
        </PreviewHeader>

        {isExecuted && (
          <DownloadButton onClick={handleDownload}>
            코드 변환 다운로드
          </DownloadButton>
        )}

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

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;

  #preview-text {
    font-size: 0.8rem;
    font-weight: 500;
    line-height: normal;
  }

  img {
    width: 1.875rem;
    height: 1.875rem;
  }
`;

const FileName = styled.span`
  display: inline-block;
  max-width: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
`;

const ProgressBar = styled.div`
  width: 11.25rem;
  height: 0.125rem;
  background-color: #e5e7eb;
  border-radius: 999px;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  width: ${({ $progress }) => ($progress ? `${$progress}%` : "0%")};
  height: 100%;
  background: #5b975b;
  border-radius: 999px;
  transition: width 0.4s ease;
`;

const UploadStatus = styled.div`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ $success }) => ($success ? "#009900" : "#ff0000")};
  width: 100%;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10.9375rem;
  height: 2.5625rem;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
  background-color: #ff782f;
  border-radius: 10px;
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
