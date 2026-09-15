import React, { useState } from "react";
import styled from "styled-components";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";

import PreCoderFileUploadSection from "./PreCoderFileUploadSection";
import { usePreCoderFiles } from "../hooks/usePreCoderFiles";
import { useFaqRefine } from "../hooks/useFaqRefine";
import type { FaqRefineMode } from "../hooks/useFaqRefine";

// "html 정제" 탭 (html 파일 하나만으로 동작, 카피덱 엑셀 업로드 불필요):
// ① features + disclaimer 영역 자동 인식/추출 (data-copy-set 커스텀 배정)
// ② FAQ 영역(.watch-faq_item) 자동 인식/추출
// ③ index_pim html의 JSON-LD(FAQPage / VideoObject) schema deck 추출
// ④ ①+②+③을 한 번에 실행하는 전체 추출
const PreCoderFaqTab = () => {
  const [mode, setMode] = useState<FaqRefineMode>("features-disclaimer");

  const {
    htmlFile,
    htmlFileName,
    htmlUploadStatus,
    handleHtmlFileUpload,
    handleResetFiles,
  } = usePreCoderFiles();

  const {
    prefix,
    setPrefix,
    status,
    exportRows,
    warnings,
    localeCodes,
    schemaRows,
    schemaWarnings,
    featureRows,
    featureCustomRows,
    featureWarnings,
    handleRun,
    handleDownloadHtml,
    handleDownloadExcel,
    handleDownloadSchemaExcel,
    handleDownloadFeatureExcel,
    resetRefine,
  } = useFaqRefine({ mode, htmlFile, htmlFileName });

  const canRun = mode === "schema-deck" ? !!htmlFile : !!htmlFile && !!prefix.trim();

  const handleResetAll = () => {
    handleResetFiles();
    resetRefine();
  };

  const handleModeChange = (nextMode: FaqRefineMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    handleResetAll();
  };

  const getStatusText = () => {
    if (status === "loading") return mode === "schema-deck" ? "추출 중..." : "정제 중...";
    if (status === "success") return "정제 완료!";
    if (status === "fail") return "정제 실패";
    return null;
  };

  const runButtonLabel =
    mode === "schema-deck"
      ? "Schema deck 추출"
      : mode === "all"
        ? "전체 추출 실행"
        : "정제 실행";

  return (
    <div>
      <ModeToggleRow>
        <ModeButton
          $active={mode === "features-disclaimer"}
          onClick={() => handleModeChange("features-disclaimer")}
        >
          ① features + disclaimer 추출
        </ModeButton>
        <ModeButton $active={mode === "faq"} onClick={() => handleModeChange("faq")}>
          ② FAQ 추출
        </ModeButton>
        <ModeButton $active={mode === "schema-deck"} onClick={() => handleModeChange("schema-deck")}>
          ③ schema 추출
        </ModeButton>
        <ModeButton $active={mode === "all"} onClick={() => handleModeChange("all")}>
          ④ 전체 추출
        </ModeButton>
      </ModeToggleRow>
      <Gap gap={15} />

      {mode === "features-disclaimer" ? (
        <InfoBox>
          index_pim html 파일 하나만 올리면 FAQ를 제외한 나머지 영역에서 data-copy-set이
          있어야 하는 곳(<b>내용 텍스트</b>, <b>aria-label</b>, <b>alt</b>,{" "}
          <b>class="text_disclaimer"</b>)을 찾아, 비어있는 곳에만 새 data-copy-set을 배정해요.
          결과 엑셀은 전체 항목 시트와, 이번에 새로 배정한 항목만 모은 별도 시트로 나뉘어요.
          ⚠️ 자동 인식 결과이니 다운로드 전에 미리보기에서 꼭 확인해주세요.
        </InfoBox>
      ) : mode === "faq" ? (
        <InfoBox>
          html 파일 하나만 올리면 돼요. html 안의 FAQ 영역(.watch-faq_item)을 직접 인식해서
          질문/답변을 원본 카피로 추출하고, data-copy-set을 자동 배정한 html과 recoder 입력
          엑셀을 만들어드려요.
        </InfoBox>
      ) : mode === "schema-deck" ? (
        <InfoBox>
          index_pim html 안의 JSON-LD schema에서 <b>FAQPage</b>와 <b>VideoObject</b>를 자동
          인식해 Questions / Answer / Name / Description 카피를 추출해요. inLanguage의
          BCP47 값은 CA_FR, US_EN 같은 로컬 국가 컬럼으로 변환해 해당 컬럼에 넣고,
          inLanguage 원본 값은 Remark에도 기록해요.
        </InfoBox>
      ) : (
        <InfoBox>
          ①features+disclaimer, ②FAQ, ③schema를 같은 html에 한 번에 실행해요. FAQ를 먼저
          태깅한 뒤 그 결과 위에 features+disclaimer를 이어서 태깅하기 때문에 서로 겹치지
          않아요. 다운로드는 태깅이 모두 반영된 html 1개와, 항목별 recoder 입력 엑셀
          3개(FAQ / features+disclaimer / schema)로 나뉘어요.
        </InfoBox>
      )}
      <Gap gap={25} />

      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <PreCoderFileUploadSection
        htmlFileName={htmlFileName}
        htmlUploadStatus={htmlUploadStatus}
        handleHtmlFileUpload={handleHtmlFileUpload}
        showExcel={false}
      />
      <Gap gap={15} />

      {mode !== "schema-deck" && (
        <>
          <PrefixRow>
            <PrefixLabel>data-copy-set 접두사</PrefixLabel>
            <PrefixInput
              type="text"
              placeholder='예: "SC1" (SC1-001, SC1-002... 순서대로 자동 부여)'
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
            />
          </PrefixRow>
          <Gap gap={15} />
        </>
      )}

      <ResetButtonsRow>
        <ResetButton onClick={handleResetAll}>초기화</ResetButton>
      </ResetButtonsRow>

      <ActionBox>
        <RunButton $active={canRun} disabled={!canRun} onClick={handleRun}>
          {runButtonLabel}
        </RunButton>
        <StatusText>{getStatusText()}</StatusText>
      </ActionBox>
      <Gap gap={40} />

      {status === "success" && mode === "faq" && (
        <>
          <SummaryBox>
            <SummaryTextGroup>
              <SummaryText>
                총 <b>{exportRows.length}건</b>의 카피에 data-copy-set을 새로 배정했어요.
              </SummaryText>
            </SummaryTextGroup>
            <DownloadRow>
              <DownloadButton onClick={handleDownloadHtml}>📄 html 다운로드</DownloadButton>
              <DownloadButton onClick={handleDownloadExcel}>📊 recoder 입력 엑셀 다운로드</DownloadButton>
            </DownloadRow>
          </SummaryBox>
          <Gap gap={25} />

          {warnings.length > 0 && (
            <>
              <WarningBox>
                <WarningTitle>⚠️ 확인이 필요한 항목 {warnings.length}건</WarningTitle>
                <WarningList>
                  {warnings.map((w, i) => (
                    <li key={i}>{w.message}</li>
                  ))}
                </WarningList>
              </WarningBox>
              <Gap gap={25} />
            </>
          )}

          <TitleLabel text="🔎 FAQ 배정 결과 미리보기" />
          <Gap gap={15} />
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>data-copy-set</th>
                <th>구분</th>
                <th>exclude_sup</th>
                <th>enable_text_transform</th>
                <th>Copy</th>
              </tr>
            </thead>
            <tbody>
              {exportRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.key}</td>
                  <td>{row.dataCopySet}</td>
                  <td>{row.item}</td>
                  <td>{row.excludeSup ? "O" : ""}</td>
                  <td>{row.enableTextTransform ? "O" : ""}</td>
                  <td>{row.copy}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {status === "success" && mode === "schema-deck" && (
        <>
          <SummaryBox>
            <SummaryTextGroup>
              <SummaryText>
                총 <b>{schemaRows.length}건</b>의 schema copy를 추출했어요.
              </SummaryText>
              {localeCodes.length > 0 && (
                <LocaleText>
                  감지된 locale column: {localeCodes.join(", ")}
                </LocaleText>
              )}
            </SummaryTextGroup>
            <DownloadRow>
              <DownloadButton onClick={handleDownloadSchemaExcel}>
                📊 schema recoder 입력 엑셀 다운로드
              </DownloadButton>
            </DownloadRow>
          </SummaryBox>
          <Gap gap={25} />

          {schemaWarnings.length > 0 && (
            <>
              <WarningBox>
                <WarningTitle>⚠️ 확인이 필요한 항목 {schemaWarnings.length}건</WarningTitle>
                <WarningList>
                  {schemaWarnings.map((warning, i) => (
                    <li key={i}>{warning.message}</li>
                  ))}
                </WarningList>
              </WarningBox>
              <Gap gap={25} />
            </>
          )}

          <TitleLabel text="🔎 Schema deck 추출 결과" />
          <Gap gap={15} />
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Category</th>
                <th>Item</th>
                <th>original_copy</th>
                {localeCodes.map((code) => <th key={code}>{code}</th>)}
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {schemaRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.key}</td>
                  <td>{row.category}</td>
                  <td>{row.item}</td>
                  <td>{row.originalCopy}</td>
                  {localeCodes.map((code) => (
                    <td key={code}>{row.locales?.[code] ?? ""}</td>
                  ))}
                  <td>{row.remark}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {status === "success" && mode === "features-disclaimer" && (
        <>
          <SummaryBox>
            <SummaryTextGroup>
              <SummaryText>
                총 <b>{featureRows.length}건</b>의 카피를 추출했고, 그 중{" "}
                <b>{featureCustomRows.length}건</b>은 새로 data-copy-set을 배정했어요.
              </SummaryText>
            </SummaryTextGroup>
            <DownloadRow>
              <DownloadButton onClick={handleDownloadHtml}>📄 html 다운로드</DownloadButton>
              <DownloadButton onClick={handleDownloadFeatureExcel}>
                📊 recoder 입력 엑셀 다운로드 (전체 + 신규배정 시트)
              </DownloadButton>
            </DownloadRow>
          </SummaryBox>
          <Gap gap={25} />

          {featureWarnings.length > 0 && (
            <>
              <WarningBox>
                <WarningTitle>⚠️ 확인이 필요한 항목 {featureWarnings.length}건</WarningTitle>
                <WarningList>
                  {featureWarnings.map((w, i) => (
                    <li key={i}>{w.message}</li>
                  ))}
                </WarningList>
              </WarningBox>
              <Gap gap={25} />
            </>
          )}

          <TitleLabel text="🔎 추출 결과 미리보기" />
          <Gap gap={15} />
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>data-copy-set</th>
                <th>apply_type</th>
                <th>구분</th>
                <th>Category</th>
                <th>신규 배정</th>
                <th>Copy</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.key}</td>
                  <td>{row.dataCopySet}</td>
                  <td>{row.applyType}</td>
                  <td>{row.item}</td>
                  <td>{row.category}</td>
                  <td>{row.isCustom ? "O" : ""}</td>
                  <td>{row.copy}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

      {status === "success" && mode === "all" && (
        <>
          <SummaryBox>
            <SummaryTextGroup>
              <SummaryText>
                FAQ <b>{exportRows.length}건</b> · features+disclaimer{" "}
                <b>{featureRows.length}건</b>(신규 {featureCustomRows.length}건) · schema{" "}
                <b>{schemaRows.length}건</b>을 추출했어요.
              </SummaryText>
              {localeCodes.length > 0 && (
                <LocaleText>감지된 locale column: {localeCodes.join(", ")}</LocaleText>
              )}
            </SummaryTextGroup>
            <DownloadRow>
              <DownloadButton onClick={handleDownloadHtml}>
                📄 html 다운로드 (FAQ+features+disclaimer 태깅 반영)
              </DownloadButton>
            </DownloadRow>
          </SummaryBox>
          <Gap gap={25} />

          {(warnings.length > 0 || featureWarnings.length > 0 || schemaWarnings.length > 0) && (
            <>
              <WarningBox>
                <WarningTitle>
                  ⚠️ 확인이 필요한 항목{" "}
                  {warnings.length + featureWarnings.length + schemaWarnings.length}건
                </WarningTitle>
                <WarningList>
                  {warnings.map((w, i) => (
                    <li key={`faq-${i}`}>[FAQ] {w.message}</li>
                  ))}
                  {featureWarnings.map((w, i) => (
                    <li key={`feat-${i}`}>[features+disclaimer] {w.message}</li>
                  ))}
                  {schemaWarnings.map((w, i) => (
                    <li key={`schema-${i}`}>[schema] {w.message}</li>
                  ))}
                </WarningList>
              </WarningBox>
              <Gap gap={25} />
            </>
          )}

          <TitleLabel text="🔎 FAQ 추출 결과" />
          <Gap gap={15} />
          <DownloadRow>
            <DownloadButton onClick={handleDownloadExcel}>📊 FAQ 엑셀 다운로드</DownloadButton>
          </DownloadRow>
          <Gap gap={10} />
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>data-copy-set</th>
                <th>구분</th>
                <th>Copy</th>
              </tr>
            </thead>
            <tbody>
              {exportRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.key}</td>
                  <td>{row.dataCopySet}</td>
                  <td>{row.item}</td>
                  <td>{row.copy}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Gap gap={40} />

          <TitleLabel text="🔎 features + disclaimer 추출 결과" />
          <Gap gap={15} />
          <DownloadRow>
            <DownloadButton onClick={handleDownloadFeatureExcel}>
              📊 features+disclaimer 엑셀 다운로드 (전체 + 신규배정 시트)
            </DownloadButton>
          </DownloadRow>
          <Gap gap={10} />
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>data-copy-set</th>
                <th>apply_type</th>
                <th>구분</th>
                <th>신규 배정</th>
                <th>Copy</th>
              </tr>
            </thead>
            <tbody>
              {featureRows.map((row, i) => (
                <tr key={i}>
                  <td>{row.key}</td>
                  <td>{row.dataCopySet}</td>
                  <td>{row.applyType}</td>
                  <td>{row.item}</td>
                  <td>{row.isCustom ? "O" : ""}</td>
                  <td>{row.copy}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Gap gap={40} />

          <TitleLabel text="🔎 Schema 추출 결과" />
          <Gap gap={15} />
          <DownloadRow>
            <DownloadButton onClick={handleDownloadSchemaExcel}>
              📊 schema 엑셀 다운로드
            </DownloadButton>
          </DownloadRow>
          <Gap gap={10} />
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Category</th>
                <th>Item</th>
                <th>original_copy</th>
              </tr>
            </thead>
            <tbody>
              {schemaRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.key}</td>
                  <td>{row.category}</td>
                  <td>{row.item}</td>
                  <td>{row.originalCopy}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default PreCoderFaqTab;

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

const PrefixRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const PrefixLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: #32383e;
  white-space: nowrap;
`;

const PrefixInput = styled.input`
  flex: 1;
  max-width: 24rem;
  height: 2.25rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0 0.8rem;
  font-size: 0.8rem;
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

const RunButton = styled.button<{ $active: boolean }>`
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

const SummaryBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-radius: 0.5rem;
  background: #eafaf0;
  border: 1px solid #b6e6cc;
`;

const SummaryTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const SummaryText = styled.div`
  font-size: 0.85rem;
  color: #1a7f4b;
`;

const LocaleText = styled.div`
  font-size: 0.75rem;
  color: #4b5563;
`;

const DownloadRow = styled.div`
  display: flex;
  gap: 0.6rem;
`;

const DownloadButton = styled.button`
  height: 2.25rem;
  padding: 0 1rem;
  border-radius: 8px;
  background: #32383e;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
`;

const WarningBox = styled.div`
  padding: 1rem 1.2rem;
  border-radius: 0.5rem;
  background: #fff5eb;
  border: 1px solid #ffd8ad;
`;

const WarningTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #b35c00;
  margin-bottom: 0.5rem;
`;

const WarningList = styled.ul`
  list-style: disc;
  padding-left: 1.2rem;
  font-size: 0.78rem;
  color: #b35c00;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;

  th,
  td {
    border: 1px solid #eeeeee;
    padding: 0.55rem 0.7rem;
    text-align: left;
    vertical-align: top;
  }

  th {
    background: #f9f9f9;
    color: #4b5563;
    font-weight: 600;
    white-space: nowrap;
  }
`;