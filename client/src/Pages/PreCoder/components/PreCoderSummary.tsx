import React from "react";
import styled from "styled-components";

import type { PreCoderAnalysisResult } from "../utils/analyzePreCoder";

const PreCoderSummary = ({ result }: { result: PreCoderAnalysisResult }) => {
  const totalIssueCount =
    result.duplicateIssues.length +
    result.scopeIssues.length +
    result.typeMismatchIssues.length +
    result.orderIssues.length +
    result.untaggedCopyIssues.length;

  const cards = [
    { label: "HTML 내 data-copy-set", value: result.totalHtmlCopySetCount },
    { label: "카피덱 row 수", value: result.totalDeckRowCount },
    { label: "미할당(빈 값) 태그", value: result.unassignedCount, warn: result.unassignedCount > 0 },
    { label: "① 고유값 위반", value: result.duplicateIssues.length, warn: result.duplicateIssues.length > 0 },
    { label: "② 태그 스코프 이슈", value: result.scopeIssues.length, warn: result.scopeIssues.length > 0 },
    { label: "③ 카피 종류 불일치", value: result.typeMismatchIssues.length, warn: result.typeMismatchIssues.length > 0 },
    { label: "④ 순서 불일치", value: result.orderIssues.length, warn: result.orderIssues.length > 0 },
    { label: "⑤ 카피덱 누락 카피", value: result.untaggedCopyIssues.length, warn: result.untaggedCopyIssues.length > 0 },
  ];

  return (
    <Wrapper>
      <StatusBanner $ok={totalIssueCount === 0}>
        {totalIssueCount === 0
          ? "✅ recoder 입력 조건을 모두 충족합니다."
          : `⚠️ 총 ${totalIssueCount}건의 이슈가 발견되었습니다. 아래 결과를 확인해주세요.`}
      </StatusBanner>
      <CardGrid>
        {cards.map((c) => (
          <Card key={c.label} $warn={!!c.warn}>
            <CardLabel>{c.label}</CardLabel>
            <CardValue $warn={!!c.warn}>{c.value}</CardValue>
          </Card>
        ))}
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

const Card = styled.div<{ $warn: boolean }>`
  border-radius: 0.5rem;
  padding: 0.9rem 1rem;
  background: ${({ $warn }) => ($warn ? "#fff5eb" : "#f9f9f9")};
  border: 1px solid ${({ $warn }) => ($warn ? "#ffd8ad" : "#eeeeee")};
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
