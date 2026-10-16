import React from "react";
import styled from "styled-components";

import FileUploadIcon from "@/assets/shift-fill.svg";
import HtmlFileIcon from "@/assets/union.svg";

const UploadSlot = ({ label, fileName, status, accept, inputId, onChange }: any) => {
  // 같은 파일을 다시 골라도 onChange가 발생하도록 선택 직전에 input 값을 비운다.
  const clearInputValue = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.value = "";
  };

  return (
    <div>
      {status ? (
        <PreviewHeader>
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
          {/* 이 슬롯의 파일만 다시 올린다 (다른 슬롯 파일은 그대로 유지) */}
          <ReuploadLabel htmlFor={inputId}>다시 업로드</ReuploadLabel>
          <input id={inputId} type="file" accept={accept} onChange={onChange} onClick={clearInputValue} hidden />
        </PreviewHeader>
      ) : (
        <FileDropLabel htmlFor={inputId}>
          <FileDropInner>
            <img src={FileUploadIcon} alt="Upload" />
            <p>{label}</p>
          </FileDropInner>
          <input id={inputId} type="file" accept={accept} onChange={onChange} onClick={clearInputValue} hidden />
        </FileDropLabel>
      )}
    </div>
  );
};

const PreCoderFileUploadSection = ({
  htmlFileName,
  htmlUploadStatus,
  handleHtmlFileUpload,
  excelFileName,
  excelUploadStatus,
  handleExcelFileUpload,
  showExcel = true,
  extraExcelSlots = [],
}: any) => {
  // extraExcelSlots: 카피덱 종류별로 따로 받을 때 추가로 그릴 슬롯
  // ({ label, fileName, status, inputId, onChange }[]).
  return (
    <ConvertSection>
      <ConvertContainer>
        <UploadSlot
          label="사업부 제공 .html 파일을 업로드 해주세요"
          fileName={htmlFileName}
          status={htmlUploadStatus}
          accept=".html,.htm"
          inputId="dropzone-precoder-html"
          onChange={handleHtmlFileUpload}
        />
        {showExcel && (
          <UploadSlot
            label="영문 카피덱(xlsx)을 업로드 해주세요"
            fileName={excelFileName}
            status={excelUploadStatus}
            accept=".xlsx,.xls"
            inputId="dropzone-precoder-excel"
            onChange={handleExcelFileUpload}
          />
        )}
        {extraExcelSlots.map((slot: any) => (
          <UploadSlot
            key={slot.inputId}
            label={slot.label}
            fileName={slot.fileName}
            status={slot.status}
            accept=".xlsx,.xls"
            inputId={slot.inputId}
            onChange={slot.onChange}
          />
        ))}
      </ConvertContainer>
    </ConvertSection>
  );
};

export default PreCoderFileUploadSection;

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
  margin-top: 0.75rem;

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

const ReuploadLabel = styled.label`
  flex-shrink: 0;
  height: 1.9rem;
  padding: 0 0.8rem;
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #4b5563;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    border-color: #ff782f;
    color: #ff782f;
  }
`;

const ProgressBar = styled.div`
  width: 11.25rem;
  height: 0.125rem;
  background-color: #e5e7eb;
  border-radius: 999px;
  margin-top: 8px;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  width: ${({ $progress }) => ($progress ? `${$progress}%` : "0%")};
  height: 100%;
  background: #5b975b;
  border-radius: 999px;
  transition: width 0.4s ease;
`;

const UploadStatus = styled.div<{ $success: boolean }>`
  font-size: 12px;
  margin-top: 4px;
  color: ${({ $success }) => ($success ? "#009900" : "#ff0000")};
  width: 100%;
`;
