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
  ContentMismatchSection,
  SupFlagSection,
  FaqItemSection,
  SchemaCheckSection,
} from "./PreCoderResultSections";

import { usePreCoderFiles } from "../hooks/usePreCoderFiles";
import { usePreCoderAnalysis } from "../hooks/usePreCoderAnalysis";
import type { PreCoderRunMode } from "../hooks/usePreCoderAnalysis";
import { usePreCoderSave } from "../hooks/usePreCoderSave";
import { exportPreCoderResultToExcel } from "../utils/exportPreCoderExcel";

// "검사 실행" 탭: html(+카피덱)을 업로드해 검사를 돌리고, 결과를 팀 공유용으로 저장한다.
// ① features+disclaimer 검사 / ② FAQ 검사 / ③ Schema 검사 / ④ 전체 검사 네 모드로 나뉜다.
// ①②④는 html+카피덱(xlsx) 대조 방식(analyzePreCoder)을 쓰고, ③Schema는 카피덱 대조가
// 아니라 html의 JSON-LD를 직접 검사한다(카피덱 업로드 불필요). ④는 ①②를 합친 대조검사에
// Schema 검사도 함께 보여준다.
const PreCoderRunTab = () => {
  const [mode, setMode] = useState<PreCoderRunMode>("features-disclaimer");

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
    schemaResult,
    copyDeckRows,
    analyzeStatus,
    handleAnalyze,
    resetAnalysis,
  } = usePreCoderAnalysis({ htmlFile, excelFile, mode });

  const { saveStatus, handleSave } = usePreCoderSave({
    htmlFile,
    excelFile,
    copyDeckRows,
    result,
  });

  const [saveTitle, setSaveTitle] = useState("");

  const canAnalyze = mode === "schema" ? !!htmlFile : !!htmlFile && !!excelFile;

  const handleModeChange = (next: PreCoderRunMode) => {
    setMode(next);
    resetAnalysis();
  };

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
      <ModeToggleRow>
        <ModeButton
          $active={mode === "features-disclaimer"}
          onClick={() => handleModeChange("features-disclaimer")}
        >
          ① features+disclaimer 검사
        </ModeButton>
        <ModeButton $active={mode === "faq"} onClick={() => handleModeChange("faq")}>
          ② FAQ 검사
        </ModeButton>
        <ModeButton $active={mode === "schema"} onClick={() => handleModeChange("schema")}>
          ③ Schema 검사
        </ModeButton>
        <ModeButton $active={mode === "all"} onClick={() => handleModeChange("all")}>
          ④ 전체 검사
        </ModeButton>
      </ModeToggleRow>
      <Gap gap={15} />

      {mode === "schema" ? (
        <InfoBox>
          Schema 검사는 html 안의 JSON-LD(FAQPage / VideoObject)를 검사해요. schema
          카피덱(xlsx)을 함께 올리면 고유값 위반 · category/item 분류 · 카피 문자열 일치 여부까지
          대조하고, html만 올리면 schema 자체 구조만 점검해요.
        </InfoBox>
      ) : (
        <InfoBox>
          {mode === "faq"
            ? "FAQ 영역(.watch-faq_item)의 data-copy-set만 골라 카피덱과 대조해요."
            : mode === "features-disclaimer"
              ? "FAQ 영역을 제외한 나머지(features/disclaimer) 영역의 data-copy-set만 골라 카피덱과 대조해요."
              : "html 전체의 data-copy-set을 카피덱과 대조하고, Schema 검사도 함께 보여줘요."}
        </InfoBox>
      )}
      <Gap gap={25} />

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

      {mode === "schema" ? (
        schemaResult && (
          <>
            <TitleLabel text="🔎 Schema 검사 결과" />
            <Gap gap={15} />
            <WhiteBox>
              <SchemaCheckSection
                issues={schemaResult.issues}
                totalCount={schemaResult.totalCount}
                faqCount={schemaResult.faqCount}
                videoCount={schemaResult.videoCount}
                hasDeck={schemaResult.hasDeck}
                deckRowCount={schemaResult.deckRowCount}
                duplicateKeyIssues={schemaResult.duplicateKeyIssues}
                compareIssues={schemaResult.compareIssues}
              />
            </WhiteBox>
          </>
        )
      ) : (
        result && (
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
              <Gap gap={40} />
              <ContentMismatchSection issues={result.contentMismatchIssues} />
              {(mode === "faq" || mode === "all") && (
                <>
                  <Gap gap={40} />
                  <SupFlagSection issues={result.supFlagMismatchIssues} />
                  <Gap gap={40} />
                  <FaqItemSection issues={result.faqItemMismatchIssues} />
                </>
              )}
              {mode === "all" && schemaResult && (
                <>
                  <Gap gap={40} />
                  <SchemaCheckSection
                    issues={schemaResult.issues}
                    totalCount={schemaResult.totalCount}
                    faqCount={schemaResult.faqCount}
                    videoCount={schemaResult.videoCount}
                  />
                </>
              )}
            </WhiteBox>
          </>
        )
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

const ModeToggleRow = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
`;

const ModeButton = styled.button<{ $active: boolean }>`
  height: 2.25rem;
  padding: 0 1.1rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? "#ff782f" : "#d1d5db")};
  background: ${({ $active }) => ($active ? "#fff1e8" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ff782f" : "#4b5563")};
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;

  &:hover {
    border-color: #ff782f;
  }
`;

const InfoBox = styled.div`
  padding: 0.9rem 1.1rem;
  border-radius: 0.5rem;
  background: #eef2ff;
  color: #3730a3;
  font-size: 0.8rem;
  line-height: 1.5;
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