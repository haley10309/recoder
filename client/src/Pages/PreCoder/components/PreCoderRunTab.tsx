import React, { useState } from "react";
import styled from "styled-components";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";

import PreCoderFileUploadSection from "./PreCoderFileUploadSection";
import PreCoderSummary from "./PreCoderSummary";
import {
  DuplicateSection,
  ScopeSection,
  TypeMismatchSection,
  OrderSection,
  UntaggedCopySection,
  UnassignedSection,
} from "./PreCoderResultSections";

import { usePreCoderFiles } from "../hooks/usePreCoderFiles";
import { usePreCoderAnalysis } from "../hooks/usePreCoderAnalysis";
import { usePreCoderSave } from "../hooks/usePreCoderSave";
import { exportPreCoderResultToExcel } from "../utils/exportPreCoderExcel";

// "검사 실행" 탭: html + 카피덱을 업로드해 검사를 돌리고, 결과를 팀 공유용으로 저장한다.
const PreCoderRunTab = () => {
  const {
    htmlFile,
    htmlFileName,
    htmlUploadStatus,
    handleHtmlFileUpload,
    excelFile,
    excelFileName,
    excelUploadStatus,
    handleExcelFileUpload,
    handleResetFiles,
  } = usePreCoderFiles();

  const {
    result,
    copyDeckRows,
    analyzeStatus,
    handleAnalyze,
    resetAnalysis,
  } = usePreCoderAnalysis({ htmlFile, excelFile });

  const { saveStatus, handleSave } = usePreCoderSave({
    htmlFile,
    excelFile,
    copyDeckRows,
    result,
  });

  const [saveTitle, setSaveTitle] = useState("");

  const canAnalyze = !!htmlFile && !!excelFile;

  const handleResetAll = () => {
    handleResetFiles();
    resetAnalysis();
    setSaveTitle("");
  };

  const handleClickSave = async () => {
    await handleSave(saveTitle || htmlFileName);
  };

  const handleExportExcel = () => {
    if (!result) return;
    exportPreCoderResultToExcel(result, {
      title: saveTitle || htmlFileName || "PreCoder_결과",
      htmlFilename: htmlFileName,
      excelFilename: excelFileName,
      createdByName: null,
      createdAt: null,
    });
  };

  const getStatusText = () => {
    if (analyzeStatus === "loading") return "검사 중...";
    if (analyzeStatus === "success") return "검사 완료!";
    if (analyzeStatus === "fail") return "검사 실패";
    return null;
  };

  return (
    <div>
      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <PreCoderFileUploadSection
        htmlFileName={htmlFileName}
        htmlUploadStatus={htmlUploadStatus}
        handleHtmlFileUpload={handleHtmlFileUpload}
        excelFileName={excelFileName}
        excelUploadStatus={excelUploadStatus}
        handleExcelFileUpload={handleExcelFileUpload}
      />
      <Gap gap={15} />
      <ResetButtonsRow>
        <ResetButton onClick={handleResetAll}>초기화</ResetButton>
      </ResetButtonsRow>

      <ActionBox>
        <AnalyzeButton $active={canAnalyze} disabled={!canAnalyze} onClick={handleAnalyze}>
          검사 실행
        </AnalyzeButton>
        <StatusText>{getStatusText()}</StatusText>
      </ActionBox>
      <Gap gap={50} />

      {result && (
        <>
          <SaveBox>
            <SaveInput
              type="text"
              placeholder="저장할 결과 제목 (예: Fresh9_index_pim_260730)"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
            />
            <SaveButton onClick={handleClickSave} disabled={saveStatus === "loading"}>
              {saveStatus === "loading" ? "저장 중..." : "결과 저장 (팀 공유)"}
            </SaveButton>
            {saveStatus === "success" && <SavedText>✅ 저장 완료 — "결과 열람" 탭에서 확인할 수 있어요.</SavedText>}
            {saveStatus === "fail" && <FailedText>❌ 저장 실패</FailedText>}
            <ExportButton onClick={handleExportExcel}>📊 엑셀로 내보내기</ExportButton>
          </SaveBox>
          <Gap gap={25} />

          <TitleLabel text="🔎 검사 결과 요약" />
          <Gap gap={15} />
          <PreCoderSummary result={result} />
          <Gap gap={50} />

          <WhiteBox>
            <DuplicateSection issues={result.duplicateIssues} />
            <Gap gap={40} />
            <ScopeSection issues={result.scopeIssues} />
            <Gap gap={40} />
            <TypeMismatchSection issues={result.typeMismatchIssues} />
            <Gap gap={40} />
            <OrderSection issues={result.orderIssues} sequence={result.orderSequence} />
            <Gap gap={40} />
            <UntaggedCopySection issues={result.untaggedCopyIssues} />
            <Gap gap={40} />
            <UnassignedSection issues={result.unassignedIssues} count={result.unassignedCount} />
          </WhiteBox>
        </>
      )}
    </div>
  );
};

export default PreCoderRunTab;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
`;

const ResetButtonsRow = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  padding: 0 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9f9f9;
  color: #4b5563;
  font-size: 0.8rem;
  font-weight: 600;

  &:hover {
    background: #f3f4f6;
  }
`;

const ActionBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const AnalyzeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 13.9375rem;
  height: 2.5625rem;
  border-radius: 10px;
  color: white;
  background-color: ${({ $active }) => ($active ? "#ff782f" : "#d1d5db")};
  font-weight: 600;
  font-size: 0.9rem;
`;

const StatusText = styled.div`
  font-size: 13px;
  color: #4b5563;
`;

const SaveBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const SaveInput = styled.input`
  flex: 1;
  min-width: 16rem;
  height: 2.25rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 0.8rem;
  font-size: 0.8rem;
`;

const SaveButton = styled.button`
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 8px;
  background: #32383e;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;

  &:disabled {
    opacity: 0.6;
  }
`;

const SavedText = styled.span`
  font-size: 0.78rem;
  color: #1a7f4b;
  font-weight: 600;
`;

const FailedText = styled.span`
  font-size: 0.78rem;
  color: #d1691a;
  font-weight: 600;
`;

const ExportButton = styled.button`
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 8px;
  border: 1px solid #ff782f;
  background: #ffffff;
  color: #ff782f;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;

  &:hover {
    background: #fff5eb;
  }
`;
