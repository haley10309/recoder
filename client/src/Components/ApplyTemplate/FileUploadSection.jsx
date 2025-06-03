import React from "react";
import styled from "styled-components";
import FileUploadIcon from "@/assets/shift-fill.svg";
import HtmlFileIcon from "@/assets/union.svg";

const FileUploadSection = ({ fileName, htmlUploadStatus, handleFileChange, isEnglishCountry, txtUploadStatus, txtFileName, handleTranslationUpload }) => {
  return (
    <>
      <ConvertSection>
        <ConvertContainer>
          {/* HTML 업로드 */}
          <div>
            {htmlUploadStatus ? (
              <PreviewHeader style={{ marginTop: "0.75rem" }}>
                <img src={HtmlFileIcon} alt="HTML Icon" />
                <div id="preview-text">
                  <span>{fileName}</span>
                  <ProgressBar>
                    <ProgressFill $progress={100} />
                  </ProgressBar>
                  <UploadStatus $success={htmlUploadStatus === "success"}>{htmlUploadStatus === "success" ? "📂 HTML 파일 업로드 성공!" : "❌ HTML 파일 업로드 실패"}</UploadStatus>
                </div>
              </PreviewHeader>
            ) : (
              <FileDropLabel htmlFor="dropzone-file">
                <FileDropInner>
                  <img src={FileUploadIcon} alt="Upload" />
                  <p>Backup HTML 을 업로드 해주세요.</p>
                </FileDropInner>
                <input id="dropzone-file" type="file" accept=".html" onChange={handleFileChange} hidden />
              </FileDropLabel>
            )}
          </div>

          {/* 번역덱 업로드 */}
          {!isEnglishCountry && (
            <div>
              {txtUploadStatus ? (
                <PreviewHeader style={{ marginTop: "0.75rem" }}>
                  <img src={HtmlFileIcon} alt="TXT Icon" />
                  <div id="preview-text">
                    <span>{txtFileName}</span>
                    <ProgressBar>
                      <ProgressFill $progress={100} />
                    </ProgressBar>
                    <UploadStatus $success={txtUploadStatus === "success"}>{txtUploadStatus === "success" ? "📄 번역덱 TXT 업로드 성공!" : "❌ 번역덱 TXT 업로드 실패"}</UploadStatus>
                  </div>
                </PreviewHeader>
              ) : (
                <FileDropLabel htmlFor="dropzone-txt">
                  <FileDropInner>
                    <img src={FileUploadIcon} alt="Upload" />
                    <p>번역덱 TXT 파일을 업로드 해주세요.</p>
                  </FileDropInner>
                  <input id="dropzone-txt" type="file" accept=".txt" onChange={handleTranslationUpload} hidden />
                </FileDropLabel>
              )}
            </div>
          )}
        </ConvertContainer>
      </ConvertSection>
    </>
  );
};

export default FileUploadSection;

// Styled Components (같이 사용하던 걸 그대로 옮겨옴)
const SectionTitle = styled.p`
  font-size: 1rem;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

const ConvertSection = styled.div`
  display: flex;
  min-height: 11.5rem;
  border-radius: 0.625rem;
  background: #f9f9f9;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
`;

const ConvertContainer = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const FileDropLabel = styled.label`
  width: 20.625rem;
  height: 7.6875rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #111827;
  cursor: pointer;
`;

const FileDropInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  img {
    width: 24px;
    height: 24px;
  }

  p {
    font-size: 14px;
  }

  span {
    font-size: 12px;
  }
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
