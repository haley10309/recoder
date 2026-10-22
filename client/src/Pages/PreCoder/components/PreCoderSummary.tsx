import React from "react";
import styled from "styled-components";

import type { PreCoderAnalysisResult } from "../utils/analyzePreCoder";
import { PRE_CODER_SECTION_ANCHORS } from "./PreCoderResultSections";

const scrollToAnchor = (anchorId: string) => {
  const el = document.getElementById(anchorId);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

// 요약 배너에 보여주는 총 이슈 수 (④ 전체 검사의 검사별 개요에서도 같은 기준으로 쓴다).
export const countPreCoderIssues = (result: PreCoderAnalysisResult) =>
  result.duplicateIssues.length +
  (result.deckDuplicateIssues?.length ?? 0) +
  result.scopeIssues.length +
  result.typeMismatchIssues.length +
  result.orderIssues.length +
  result.untaggedCopyIssues.length +
  (result.contentMismatchIssues?.length ?? 0) +
  (result.supFlagMismatchIssues?.length ?? 0) +
  (result.faqItemMismatchIssues?.length ?? 0);

const PreCoderSummary = ({ result }: { result: PreCoderAnalysisResult }) => {
  // contentMismatchIssues/supFlagMismatchIssues는 나중에 추가된 필드라,
  // 그 이전에 저장된 결과에는 없을 수 있다.
  const contentMismatchCount = result.contentMismatchIssues?.length ?? 0;
  const supFlagCount = result.supFlagMismatchIssues?.length ?? 0;
  const faqItemCount = result.faqItemMismatchIssues?.length ?? 0;
  const deckDuplicateCount = result.deckDuplicateIssues?.length ?? 0;

  const totalIssueCount = countPreCoderIssues(result);

  const cards = [
    { label: "HTML 내 data-copy-set", value: result.totalHtmlCopySetCount },
    { label: "카피덱 row 수", value: result.totalDeckRowCount },
    {
      label: "① 고유값 위반",
      value: result.duplicateIssues.length,
      warn: result.duplicateIssues.length > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.duplicate,
    },
    {
      label: "①-2 카피덱 고유값 위반",
      value: deckDuplicateCount,
      warn: deckDuplicateCount > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.deckDuplicate,
    },
    {
      label: "② 태그 스코프 이슈",
      value: result.scopeIssues.length,
      warn: result.scopeIssues.length > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.scope,
    },
    {
      label: "③ 카피 종류 불일치",
      value: result.typeMismatchIssues.length,
      warn: result.typeMismatchIssues.length > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.type,
    },
    {
      label: "④ 순서 불일치",
      value: result.orderIssues.length,
      warn: result.orderIssues.length > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.order,
    },
    {
      label: "⑤ 카피덱 누락 카피",
      value: result.untaggedCopyIssues.length,
      warn: result.untaggedCopyIssues.length > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.untagged,
    },
    {
      label: "⑥ 미할당(빈 값) 태그",
      value: result.unassignedCount,
      warn: result.unassignedCount > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.unassigned,
    },
    {
      label: "⑦ 카피 문자열 불일치",
      value: contentMismatchCount,
      warn: contentMismatchCount > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.contentMismatch,
    },
    {
      label: "⑧ exclude_sup / text_transform 불일치",
      value: supFlagCount,
      warn: supFlagCount > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.supFlag,
    },
    {
      label: "⑨ FAQ item 분류 불일치",
      value: faqItemCount,
      warn: faqItemCount > 0,
      anchorId: PRE_CODER_SECTION_ANCHORS.faqItem,
    },
  ];

  return (
    <Wrapper>
      <StatusBanner $ok={totalIssueCount === 0}>
        {totalIssueCount === 0
          ? "✅ recoder 입력 조건을 모두 충족합니다."
          : `⚠️ 총 ${totalIssueCount}건의 이슈가 발견되었습니다. 아래 결과를 확인해주세요.`}
      </StatusBanner>
      <CardGrid>
        {cards.map((c) => {
          const clickable = !!c.anchorId && c.value > 0;
          return (
            <Card
              key={c.label}
              $warn={!!c.warn}
              $clickable={clickable}
              onClick={clickable ? () => scrollToAnchor(c.anchorId as string) : undefined}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
            >
              <CardLabel>{c.label}</CardLabel>
              <CardValue $warn={!!c.warn}>{c.value}</CardValue>
              {clickable && <AnchorChip>바로가기 →</AnchorChip>}
            </Card>
          );
        })}
      </CardGrid>
    </Wrapper>
  );
};

export default PreCoderSummary;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatusBanner = styled.div<{ $ok: boolean }>`
  padding: 0.9rem 1.2rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${({ $ok }) => ($ok ? "#eafaf0" : "#fff5eb")};
  color: ${({ $ok }) => ($ok ? "#1a7f4b" : "#b35c00")};
  border: 1px solid ${({ $ok }) => ($ok ? "#b6e6cc" : "#ffd8ad")};
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Card = styled.div<{ $warn: boolean; $clickable: boolean }>`
  position: relative;
  border-radius: 0.5rem;
  padding: 0.9rem 1rem;
  background: ${({ $warn }) => ($warn ? "#fff5eb" : "#f9f9f9")};
  border: 1px solid ${({ $warn }) => ($warn ? "#ffd8ad" : "#eeeeee")};
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};
  transition: transform 0.12s ease, box-shadow 0.12s ease;

  ${({ $clickable }) =>
    $clickable &&
    `
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      }
      &:focus-visible {
        outline: 2px solid #ff782f;
        outline-offset: 2px;
      }
    `}
`;

const CardLabel = styled.div`
  font-size: 0.72rem;
  color: #6b7280;
  margin-bottom: 0.35rem;
`;

const CardValue = styled.div<{ $warn: boolean }>`
  font-size: 1.35rem;
  font-weight: 700;
  color: ${({ $warn }) => ($warn ? "#d1691a" : "#111827")};
`;

const AnchorChip = styled.span`
  display: inline-block;
  margin-top: 0.5rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: #ff782f;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
`;