import React from "react";
import styled from "styled-components";

import PageDescriptionText from "@/Components/Common/PageDescriptionText";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";

import PreCoderFileUploadSection from "./components/PreCoderFileUploadSection";
import PreCoderSummary from "./components/PreCoderSummary";
import {
  DuplicateSection,
  ScopeSection,
  TypeMismatchSection,
  OrderSection,
  UntaggedCopySection,
} from "./components/PreCoderResultSections";

import { usePreCoderFiles } from "./hooks/usePreCoderFiles";
import { usePreCoderAnalysis } from "./hooks/usePreCoderAnalysis";

// pre-coder: wwpd 작업 전 recoder에 넣기 위한 파일(html) 최적화 검사 화면.
// 사업부 제공 .html + 영문 카피덱(xlsx)을 업로드하면 recoder 입력 조건 충족 여부를 검사한다.
const PreCoderScreen = () => {
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

  const { result, analyzeStatus, handleAnalyze, resetAnalysis } = usePreCoderAnalysis({
    htmlFile,
    excelFile,
  });

  const canAnalyze = !!htmlFile && !!excelFile;

  const handleResetAll = () => {
    handleResetFiles();
    resetAnalysis();
  };

  const getStatusText = () => {
    if (analyzeStatus === "loading") return "검사 중...";
    if (analyzeStatus === "success") return "검사 완료!";
    if (analyzeStatus === "fail") return "검사 실패";
    return null;
  };

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText
        text={
          "wwpd 작업 전 recoder에 넣기 위한 파일 최적화 검사입니다. 사업부에서 제공하는 .html 파일과 영문 카피덱이 recoder에 입력할 만한 조건을 갖추었는지 확인 및 정제합니다."
        }
      />
      <Gap gap={50} />

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
        <ResetButton onClick={handleResetAll}>파일 초기화</ResetButton>
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
          </WhiteBox>
        </>
      )}

      <Gap gap={50} />
    </div>
  );
};

export default PreCoderScreen;

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
