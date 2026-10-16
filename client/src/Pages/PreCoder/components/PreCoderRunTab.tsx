import React, { useState } from "react";
import styled from "styled-components";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";

import PreCoderFileUploadSection from "./PreCoderFileUploadSection";
import PreCoderSummary, { countPreCoderIssues } from "./PreCoderSummary";
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
import type { PreCoderAnalysisResult } from "../utils/analyzePreCoder";
import type { SchemaCheckResult } from "../utils/analyzeSchemaDeck";

// ④ 전체 검사 결과에서 지금 보고 있는 검사 (요약 카드의 앵커 id가 겹치지 않도록 한 번에 하나만 그린다)
type AllResultTabKey = "features" | "faq" | "schema";

const ALL_RESULT_TAB_LABELS: Record<AllResultTabKey, string> = {
  features: "① features+disclaimer",
  faq: "② FAQ",
  schema: "③ Schema",
};

// "검사 실행" 탭: html(+카피덱)을 업로드해 검사를 돌리고, 결과를 팀 공유용으로 저장한다.
// ① features+disclaimer 검사 / ② FAQ 검사 / ③ Schema 검사 / ④ 전체 검사 네 모드로 나뉜다.
// ①②는 html+카피덱(xlsx) 대조 방식(analyzePreCoder)을 쓰고, ③Schema는 html의 JSON-LD를
// 직접 검사한다(schema 카피덱은 선택). ④는 features / FAQ / Schema 카피덱을 각각 받아
// ①②③을 개별 모드와 같은 방식으로 한 번에 돌리고, 결과를 검사별로 나눠 보여준다.
const PreCoderRunTab = () => {
  const [mode, setMode] = useState<PreCoderRunMode>("features-disclaimer");
  const [allResultTab, setAllResultTab] = useState<AllResultTabKey>("features");

  const {
    htmlFile,
    htmlFileName,
    htmlUploadStatus,
    handleHtmlFileUpload,
    excelFile,
    excelFileName,
    excelUploadStatus,
    handleExcelFileUpload,
    faqExcelFile,
    faqExcelFileName,
    faqExcelUploadStatus,
    handleFaqExcelFileUpload,
    schemaExcelFile,
    schemaExcelFileName,
    schemaExcelUploadStatus,
    handleSchemaExcelFileUpload,
    handleResetFiles,
  } = usePreCoderFiles();

  const {
    result,
    allResult,
    schemaResult,
    copyDeckRows,
    analyzeStatus,
    handleAnalyze,
    resetAnalysis,
  } = usePreCoderAnalysis({
    htmlFile,
    featuresExcelFile: excelFile,
    faqExcelFile,
    schemaExcelFile,
    mode,
  });

  // 저장/내보내기 대상: ②FAQ 모드, 또는 ④ 전체 검사에서 ② 결과를 보고 있을 때는 FAQ 카피덱,
  // 그 밖에는 features 카피덱. (④에서는 지금 보고 있는 ①/② 결과를 대상으로 삼는다.)
  const allDeckTab = allResultTab === "faq" ? "faq" : "features";
  const isFaqDeckActive = mode === "faq" || (mode === "all" && allDeckTab === "faq");
  const activeResult = mode === "all" ? (allResult?.[allDeckTab].result ?? null) : result;
  const activeCopyDeckRows = mode === "all" ? (allResult?.[allDeckTab].copyDeckRows ?? null) : copyDeckRows;
  const activeExcelFile = isFaqDeckActive ? faqExcelFile : excelFile;
  const activeExcelFileName = isFaqDeckActive ? faqExcelFileName : excelFileName;

  const { saveStatus, handleSave, resetSaveStatus } = usePreCoderSave({
    htmlFile,
    excelFile: activeExcelFile,
    copyDeckRows: activeCopyDeckRows,
    result: activeResult,
  });

  const [saveTitle, setSaveTitle] = useState("");

  const canAnalyze =
    mode === "schema"
      ? !!htmlFile
      : mode === "all"
        ? !!htmlFile && !!excelFile && !!faqExcelFile
        : mode === "faq"
          ? !!htmlFile && !!faqExcelFile
          : !!htmlFile && !!excelFile;

  // 파일을 새로 올리면(다시 업로드 포함) 이전 파일로 낸 검사 결과는 지운다.
  // (화면의 결과와 저장 시 함께 올라가는 파일이 서로 달라지지 않도록)
  const withResultReset =
    (handler: (e: React.ChangeEvent<HTMLInputElement>) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const hasFile = !!e.target.files?.[0];
      handler(e);
      if (hasFile) {
        resetAnalysis();
        resetSaveStatus();
      }
    };

  // 카피덱 종류별 업로드 슬롯. 모드마다 필요한 슬롯만 보여주고, 종류가 같은 슬롯은 모드끼리 공유한다.
  const featuresSlot = {
    title: "features 카피덱",
    label: "features 영문 카피덱(.xlsx) 업로드",
    fileName: excelFileName,
    status: excelUploadStatus,
    inputId: "dropzone-precoder-excel",
    onChange: withResultReset(handleExcelFileUpload),
  };
  const faqSlot = {
    title: "FAQ 카피덱",
    label: "FAQ 영문 카피덱(.xlsx) 업로드",
    fileName: faqExcelFileName,
    status: faqExcelUploadStatus,
    inputId: "dropzone-precoder-excel-faq",
    onChange: withResultReset(handleFaqExcelFileUpload),
  };
  const schemaSlot = {
    title: "Schema 카피덱 (선택)",
    label: "Schema 카피덱(.xlsx) 업로드",
    fileName: schemaExcelFileName,
    status: schemaExcelUploadStatus,
    inputId: "dropzone-precoder-excel-schema",
    onChange: withResultReset(handleSchemaExcelFileUpload),
  };
  const excelSlots =
    mode === "features-disclaimer"
      ? [featuresSlot]
      : mode === "faq"
        ? [faqSlot]
        : mode === "schema"
          ? [schemaSlot]
          : [featuresSlot, faqSlot, schemaSlot];

  const handleModeChange = (next: PreCoderRunMode) => {
    setMode(next);
    setAllResultTab("features");
    resetAnalysis();
    resetSaveStatus();
  };

  const handleAllResultTabChange = (next: AllResultTabKey) => {
    setAllResultTab(next);
    resetSaveStatus();
  };

  const handleResetAll = () => {
    handleResetFiles();
    resetAnalysis();
    resetSaveStatus();
    setSaveTitle("");
  };

  const handleClickSave = async () => {
    await handleSave(saveTitle || htmlFileName);
  };

  const handleExportExcel = () => {
    if (!activeResult) return;
    exportPreCoderResultToExcel(activeResult, {
      title: saveTitle || htmlFileName || "PreCoder_결과",
      htmlFilename: htmlFileName,
      excelFilename: activeExcelFileName,
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

  // ①②(카피덱 대조) 결과 화면: 저장/내보내기 + 요약 + 상세 섹션
  const renderDeckResult = (
    deckResult: PreCoderAnalysisResult,
    scope: "features-disclaimer" | "faq"
  ) => (
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
      <PreCoderSummary result={deckResult} />
      <Gap gap={50} />

      <WhiteBox>
        <DuplicateSection issues={deckResult.duplicateIssues} />
        <Gap gap={40} />
        <ScopeSection issues={deckResult.scopeIssues} />
        <Gap gap={40} />
        <TypeMismatchSection issues={deckResult.typeMismatchIssues} />
        <Gap gap={40} />
        <OrderSection issues={deckResult.orderIssues} sequence={deckResult.orderSequence} />
        <Gap gap={40} />
        <UntaggedCopySection issues={deckResult.untaggedCopyIssues} />
        <Gap gap={40} />
        <UnassignedSection issues={deckResult.unassignedIssues} count={deckResult.unassignedCount} />
        <Gap gap={40} />
        <ContentMismatchSection issues={deckResult.contentMismatchIssues} />
        {scope === "faq" && (
          <>
            <Gap gap={40} />
            <SupFlagSection issues={deckResult.supFlagMismatchIssues} />
            <Gap gap={40} />
            <FaqItemSection issues={deckResult.faqItemMismatchIssues} />
          </>
        )}
      </WhiteBox>
    </>
  );

  const renderSchemaResult = (schema: SchemaCheckResult) => (
    <>
      <TitleLabel text="🔎 Schema 검사 결과" />
      <Gap gap={15} />
      <WhiteBox>
        <SchemaCheckSection
          issues={schema.issues}
          totalCount={schema.totalCount}
          faqCount={schema.faqCount}
          videoCount={schema.videoCount}
          hasDeck={schema.hasDeck}
          deckRowCount={schema.deckRowCount}
          duplicateKeyIssues={schema.duplicateKeyIssues}
          compareIssues={schema.compareIssues}
        />
      </WhiteBox>
    </>
  );

  const renderAllResult = () => {
    if (!allResult || !schemaResult) return null;

    const issueCounts: Record<AllResultTabKey, number> = {
      features: countPreCoderIssues(allResult.features.result),
      faq: countPreCoderIssues(allResult.faq.result),
      schema: schemaResult.issues.length,
    };

    return (
      <>
        <TitleLabel text="🧾 전체 검사 결과" />
        <Gap gap={15} />
        <OverviewRow>
          {(Object.keys(ALL_RESULT_TAB_LABELS) as AllResultTabKey[]).map((key) => (
            <OverviewCard
              key={key}
              $active={allResultTab === key}
              $warn={issueCounts[key] > 0}
              onClick={() => handleAllResultTabChange(key)}
            >
              <OverviewLabel>{ALL_RESULT_TAB_LABELS[key]} 검사</OverviewLabel>
              <OverviewValue $warn={issueCounts[key] > 0}>
                {issueCounts[key] === 0 ? "✅ 이슈 없음" : `⚠️ ${issueCounts[key]}건`}
              </OverviewValue>
            </OverviewCard>
          ))}
        </OverviewRow>
        <Gap gap={30} />

        {allResultTab === "features" && renderDeckResult(allResult.features.result, "features-disclaimer")}
        {allResultTab === "faq" && renderDeckResult(allResult.faq.result, "faq")}
        {allResultTab === "schema" && renderSchemaResult(schemaResult)}
      </>
    );
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

      <InfoBox>
        {mode === "schema"
          ? "Schema 검사는 html 안의 JSON-LD(FAQPage / VideoObject)를 검사해요. schema 카피덱(xlsx)을 함께 올리면 고유값 위반 · category/item 분류 · 카피 문자열 일치 여부까지 대조하고, html만 올리면 schema 자체 구조만 점검해요."
          : mode === "faq"
            ? "FAQ 영역(.watch-faq_item)의 data-copy-set만 골라 카피덱과 대조해요."
            : mode === "features-disclaimer"
              ? "FAQ 영역을 제외한 나머지(features/disclaimer) 영역의 data-copy-set만 골라 카피덱과 대조해요."
              : "features / FAQ / Schema 카피덱을 각각 올리면 ①②③ 검사를 한 번에 실행하고, 결과를 검사별로 나눠 보여줘요. (Schema 카피덱은 선택 - 없으면 html schema 자체 구조만 점검해요.)"}
      </InfoBox>
      <Gap gap={25} />

      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <PreCoderFileUploadSection
        htmlFileName={htmlFileName}
        htmlUploadStatus={htmlUploadStatus}
        handleHtmlFileUpload={withResultReset(handleHtmlFileUpload)}
        showExcel={false}
        extraExcelSlots={excelSlots}
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

      {mode === "schema" && schemaResult && renderSchemaResult(schemaResult)}
      {(mode === "features-disclaimer" || mode === "faq") && result && renderDeckResult(result, mode)}
      {mode === "all" && renderAllResult()}
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
const OverviewRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 0.8rem;
`;

const OverviewCard = styled.button<{ $active: boolean; $warn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  padding: 0.9rem 1.1rem;
  border-radius: 0.625rem;
  border: 2px solid ${({ $active }) => ($active ? "#ff782f" : "#e5e7eb")};
  background: ${({ $active }) => ($active ? "#fff1e8" : "#ffffff")};
  text-align: left;

  &:hover {
    border-color: #ff782f;
  }
`;

const OverviewLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: #4b5563;
`;

const OverviewValue = styled.span<{ $warn: boolean }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $warn }) => ($warn ? "#d1691a" : "#1a7f4b")};
`;
