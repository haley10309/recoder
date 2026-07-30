import React, { useState } from "react";
import styled from "styled-components";

import PageDescriptionText from "@/Components/Common/PageDescriptionText";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";

import PreCoderFileUploadSection from "./components/PreCoderFileUploadSection";
import PreCoderSummary from "./components/PreCoderSummary";
import PreCoderHistoryPanel from "./components/PreCoderHistoryPanel";
import {
  DuplicateSection,
  ScopeSection,
  TypeMismatchSection,
  OrderSection,
  UntaggedCopySection,
} from "./components/PreCoderResultSections";

import { usePreCoderFiles } from "./hooks/usePreCoderFiles";
import { usePreCoderAnalysis } from "./hooks/usePreCoderAnalysis";
import { usePreCoderSave } from "./hooks/usePreCoderSave";
import { usePreCoderHistory } from "./hooks/usePreCoderHistory";
import type { PreCoderAnalysisResult } from "./utils/analyzePreCoder";

// pre-coder: wwpd 작업 전 recoder에 넣기 위한 파일(html) 최적화 검사 화면.
// 사업부 제공 .html + 영문 카피덱(xlsx)을 업로드하면 recoder 입력 조건 충족 여부를 검사하고,
// 결과를 DB에 저장해 다른 팀원들도 함께 볼 수 있다.
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

  const {
    result: freshResult,
    copyDeckRows,
    analyzeStatus,
    handleAnalyze,
    resetAnalysis,
  } = usePreCoderAnalysis({ htmlFile, excelFile });

  const { saveStatus, handleSave } = usePreCoderSave({
    htmlFile,
    excelFile,
    copyDeckRows,
    result: freshResult,
  });

  const {
    historyList,
    historyLoadStatus,
    refreshHistory,
    loadedResult,
    detailLoadStatus,
    loadResultDetail,
    clearLoadedResult,
  } = usePreCoderHistory();

  const [saveTitle, setSaveTitle] = useState("");

  const canAnalyze = !!htmlFile && !!excelFile;
  // 방금 새로 돌린 검사 결과가 있으면 그걸, 아니면 히스토리에서 불러온 결과를 보여준다.
  const displayResult: PreCoderAnalysisResult | null = freshResult ?? loadedResult?.result ?? null;

  const handleResetAll = () => {
    handleResetFiles();
    resetAnalysis();
    clearLoadedResult();
    setSaveTitle("");
  };

  const handleSelectHistory = async (id: number) => {
    handleResetFiles();
    resetAnalysis();
    await loadResultDetail(id);
  };

  const handleClickSave = async () => {
    await handleSave(saveTitle || htmlFileName);
    refreshHistory();
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

      <TitleLabel text="🗂 저장된 검사 결과" />
      <Gap gap={15} />
      <PreCoderHistoryPanel
        historyList={historyList}
        historyLoadStatus={historyLoadStatus}
        onSelect={handleSelectHistory}
        selectedId={loadedResult?.id}
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
        <ResetButton onClick={handleResetAll}>초기화</ResetButton>
      </ResetButtonsRow>

      <ActionBox>
        <AnalyzeButton $active={canAnalyze} disabled={!canAnalyze} onClick={handleAnalyze}>
          검사 실행
        </AnalyzeButton>
        <StatusText>
          {getStatusText() || (detailLoadStatus === "loading" ? "결과 불러오는 중..." : "")}
        </StatusText>
      </ActionBox>
      <Gap gap={50} />

      {displayResult && (
        <>
          {loadedResult && !freshResult && (
            <LoadedBanner>
              📌 <b>{loadedResult.title}</b> ({loadedResult.htmlFilename} / {loadedResult.excelFilename})
              {loadedResult.createdByName && <> · 저장자: {loadedResult.createdByName}</>} ·{" "}
              {new Date(loadedResult.createdAt).toLocaleString("ko-KR")}
            </LoadedBanner>
          )}

          {freshResult && (
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
              {saveStatus === "success" && <SavedText>✅ 저장 완료</SavedText>}
              {saveStatus === "fail" && <FailedText>❌ 저장 실패</FailedText>}
            </SaveBox>
          )}
          <Gap gap={25} />

          <TitleLabel text="🔎 검사 결과 요약" />
          <Gap gap={15} />
          <PreCoderSummary result={displayResult} />
          <Gap gap={50} />

          <WhiteBox>
            <DuplicateSection issues={displayResult.duplicateIssues} />
            <Gap gap={40} />
            <ScopeSection issues={displayResult.scopeIssues} />
            <Gap gap={40} />
            <TypeMismatchSection issues={displayResult.typeMismatchIssues} />
            <Gap gap={40} />
            <OrderSection issues={displayResult.orderIssues} sequence={displayResult.orderSequence} />
            <Gap gap={40} />
            <UntaggedCopySection issues={displayResult.untaggedCopyIssues} />
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

const LoadedBanner = styled.div`
  padding: 0.8rem 1.1rem;
  border-radius: 0.5rem;
  background: #eef2ff;
  color: #3730a3;
  font-size: 0.8rem;
  margin-bottom: 1rem;
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
