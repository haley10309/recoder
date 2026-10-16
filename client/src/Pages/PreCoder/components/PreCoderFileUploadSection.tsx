import React from "react";
import styled from "styled-components";

import FileUploadIcon from "@/assets/shift-fill.svg";
import HtmlFileIcon from "@/assets/union.svg";

// 업로드 슬롯 하나. 업로드 전(점선 드롭존) / 후(파일 카드) 모두 같은 크기의 카드로 그려서
// 슬롯 여러 개가 한 줄에 나란히 있어도 높이·너비가 어긋나지 않도록 한다.
const UploadSlot = ({ title, label, fileName, status, accept, inputId, onChange }: any) => {
  // 같은 파일을 다시 골라도 onChange가 발생하도록 선택 직전에 input 값을 비운다.
  const clearInputValue = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.value = "";
  };

  const input = (
    <input id={inputId} type="file" accept={accept} onChange={onChange} onClick={clearInputValue} hidden />
  );

  if (!status) {
    return (
      <EmptyCard htmlFor={inputId}>
        <SlotTitle>{title}</SlotTitle>
        <img src={FileUploadIcon} alt="Upload" />
        <CardText>{label}</CardText>
        {input}
      </EmptyCard>
    );
  }

  const success = status === "success";
  return (
    <FilledCard $success={success}>
      <SlotTitle>{title}</SlotTitle>
      <FileRow>
        <img src={HtmlFileIcon} alt="File Icon" />
        <FileName title={fileName}>{fileName || "-"}</FileName>
      </FileRow>
      <UploadStatus $success={success}>{success ? "✅ 업로드 성공!" : "❌ 업로드 실패"}</UploadStatus>
      {/* 이 슬롯의 파일만 다시 올린다 (다른 슬롯 파일은 그대로 유지) */}
      <ReuploadLabel htmlFor={inputId}>다시 업로드</ReuploadLabel>
      {input}
    </FilledCard>
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
  // ({ title, label, fileName, status, inputId, onChange }[]).
  return (
    <ConvertSection>
      <ConvertContainer>
        <UploadSlot
          title="html 파일"
          label="사업부 제공 .html 파일 업로드"
          fileName={htmlFileName}
          status={htmlUploadStatus}
          accept=".html,.htm"
          inputId="dropzone-precoder-html"
          onChange={handleHtmlFileUpload}
        />
        {showExcel && (
          <UploadSlot
            title="영문 카피덱"
            label="영문 카피덱(.xlsx) 업로드"
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
            title={slot.title}
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
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
`;

const cardBase = `
  width: 15rem;
  height: 9.5rem;
  padding: 0.9rem 1rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
`;

const EmptyCard = styled.label`
  ${cardBase}
  border: 2px dashed #d1d5db;
  color: #111827;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;

  img {
    width: 24px;
    height: 24px;
  }

  &:hover {
    border-color: #ff782f;
    background: #fffaf6;
  }
`;

const FilledCard = styled.div<{ $success: boolean }>`
  ${cardBase}
  border: 2px solid ${({ $success }) => ($success ? "#cfe6cf" : "#f5c2c2")};
  background: #ffffff;
`;

const SlotTitle = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: #ff782f;
`;

const CardText = styled.p`
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  word-break: keep-all;
`;

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 100%;

  img {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const FileName = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UploadStatus = styled.div<{ $success: boolean }>`
  font-size: 12px;
  color: ${({ $success }) => ($success ? "#009900" : "#ff0000")};
`;

const ReuploadLabel = styled.label`
  height: 1.75rem;
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
