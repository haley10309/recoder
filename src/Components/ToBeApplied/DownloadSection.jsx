import styled from "styled-components";

export default function DownloadSection({
  isExecuted,
  isLocalizationApplied,
  handleDownload,
  handleLocalizedDownload,
}) {
  return (
    <>
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
    </>
  );
}

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
