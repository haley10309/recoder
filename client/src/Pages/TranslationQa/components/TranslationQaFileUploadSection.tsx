import React from "react";
import styled from "styled-components";

import FileUploadIcon from "@/assets/shift-fill.svg";
import HtmlFileIcon from "@/assets/union.svg";

const UploadSlot = ({ label, fileName, status, accept, inputId, onChange }) => {
  return (
    <div>
      {status ? (
        <PreviewHeader style={{ marginTop: "0.75rem" }}>
          <img src={HtmlFileIcon} alt="File Icon" />
          <div id="preview-text">
            <span>{fileName}</span>
            <ProgressBar>
              <ProgressFill $progress={100} />
            </ProgressBar>
            <UploadStatus $success={status === "success"}>
              {status === "success" ? "✅ 업로드 성공!" : "❌ 업로드 실패"}
            </UploadStatus>
          </div>
        </PreviewHeader>
      ) : (
        <FileDropLabel htmlFor={inputId}>
          <FileDropInner>
            <img src={FileUploadIcon} alt="Upload" />
            <p>{label}</p>
          </FileDropInner>
          <input id={inputId} type="file" accept={accept} onChange={onChange} hidden />
        </FileDropLabel>
      )}
    </div>
  );
};

const TranslationQaFileUploadSection = ({
  beforeFileName,
  beforeUploadStatus,
  handleBeforeFileUpload,
  afterFileName,
  afterUploadStatus,
  handleAfterFileUpload,
  excelFileName,
  excelUploadStatus,
  handleExcelFileUpload,
}) => {
  return (
    <ConvertSection>
      <ConvertContainer>
        <UploadSlot
          label="before.html (번역 반영 전 코드)을 업로드 해주세요"
          fileName={beforeFileName}
          status={beforeUploadStatus}
          accept=".html"
          inputId="dropzone-qa-before-html"
          onChange={handleBeforeFileUpload}
        />
        <UploadSlot
          label="after.html (번역 반영 후 최종 코드)을 업로드 해주세요"
          fileName={afterFileName}
          status={afterUploadStatus}
          accept=".html"
          inputId="dropzone-qa-after-html"
          onChange={handleAfterFileUpload}
        />
        <UploadSlot
          label="copy.xlsx (카피덱 엑셀)을 업로드 해주세요"
          fileName={excelFileName}
          status={excelUploadStatus}
          accept=".xlsx"
          inputId="dropzone-qa-excel"
          onChange={handleExcelFileUpload}
        />
      </ConvertContainer>
    </ConvertSection>
  );
};

export default TranslationQaFileUploadSection;

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
  flex-wrap: wrap;
`;

const FileDropLabel = styled.label`
  width: 18.5rem;
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
  padding: 0 1rem;

  img {
    width: 24px;
    height: 24px;
  }

  p {
    font-size: 13px;
    text-align: center;
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
