import React from "react";
import styled from "styled-components";

import type {
  DuplicateIssue,
  ScopeIssue,
  TypeMismatchIssue,
  OrderIssue,
  OrderSequenceItem,
  UntaggedCopyIssue,
  UnassignedTagIssue,
} from "../utils/analyzePreCoder";
import type { SchemaCheckIssue } from "../utils/analyzeSchemaDeck";

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #32383e;
  margin-bottom: 0.6rem;
`;

const EmptyState = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  background: #eafaf0;
  color: #1a7f4b;
  font-size: 0.82rem;
  font-weight: 600;
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

const Pill = styled.span<{ $tone?: "warn" | "ok" | "neutral" }>`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  background: ${({ $tone }) =>
    $tone === "ok" ? "#eafaf0" : $tone === "neutral" ? "#f3f4f6" : "#fff0e0"};
  color: ${({ $tone }) =>
    $tone === "ok" ? "#1a7f4b" : $tone === "neutral" ? "#4b5563" : "#d1691a"};
`;

const LineBadge = styled.span`
  font-family: monospace;
  color: #6b7280;
`;

const CodeSnippet = styled.code`
  display: block;
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.72rem;
  color: #b35c00;
  background: #fff8f0;
  border: 1px solid #ffe4c2;
  border-radius: 0.35rem;
  padding: 0.4rem 0.55rem;
  white-space: pre-wrap;
  word-break: break-all;
`;

// 요약 카드에서 클릭했을 때 해당 섹션으로 스크롤 이동하기 위한 앵커 id.
export const PRE_CODER_SECTION_ANCHORS = {
  duplicate: "precoder-section-duplicate",
  scope: "precoder-section-scope",
  type: "precoder-section-type",
  order: "precoder-section-order",
  untagged: "precoder-section-untagged",
  unassigned: "precoder-section-unassigned",
  schema: "precoder-section-schema",
} as const;

const SectionAnchor = styled.div`
  scroll-margin-top: 90px;
`;

// ────────────────────────────────────────────────────────────────────────────
// ① 고유값 검사
// ────────────────────────────────────────────────────────────────────────────
export const DuplicateSection = ({ issues }: { issues: DuplicateIssue[] }) => (
  <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.duplicate}>
    <SectionTitle>① data-copy-set 고유값 검사 (서로 다른 카피가 같은 값을 공유하는 경우)</SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>서로 다른 카피가 동일한 data-copy-set을 공유하는 경우가 없습니다.</EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>data-copy-set</th>
            <th>중복 횟수</th>
            <th>줄 번호</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue.value}>
              <td>{issue.value}</td>
              <td>{issue.count}</td>
              <td>
                {issue.lines
                  .map((l) => (l >= 0 ? l : "-"))
                  .join(", ")}
              </td>
              <td>{issue.message}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </SectionAnchor>
);

// ────────────────────────────────────────────────────────────────────────────
// ② 태그 스코프 검사
// ────────────────────────────────────────────────────────────────────────────
export const ScopeSection = ({ issues }: { issues: ScopeIssue[] }) => (
  <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.scope}>
    <SectionTitle>② 태그 스코프 검사 (부모/자식 중첩 · 카피덱-HTML 대조)</SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>부모/자식 태그 중첩이나 카피덱-HTML 불일치가 없습니다.</EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>data-copy-set</th>
            <th>유형</th>
            <th>줄 번호</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, i) => (
            <tr key={`${issue.value}-${i}`}>
              <td>{issue.value}</td>
              <td>
                <Pill>
                  {issue.type === "nested-child"
                    ? "부모/자식 중첩"
                    : issue.type === "child-missing-copyset"
                    ? "자식 태그 data-copy-set 누락"
                    : "카피덱 값이 HTML에 없음"}
                </Pill>
              </td>
              <td>
                <LineBadge>{issue.line && issue.line >= 0 ? issue.line : "-"}</LineBadge>
              </td>
              <td>{issue.message}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </SectionAnchor>
);

// ────────────────────────────────────────────────────────────────────────────
// ③ 카피 종류 자동 분류 검사
// ────────────────────────────────────────────────────────────────────────────
export const TypeMismatchSection = ({ issues }: { issues: TypeMismatchIssue[] }) => (
  <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.type}>
    <SectionTitle>③ 카피 종류 자동 분류 검사 (alt / aria-label / disclaimer / innerText)</SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>카피 종류 불일치가 없습니다.</EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>data-copy-set</th>
            <th>태그</th>
            <th>카피덱 지정 종류</th>
            <th>HTML 감지 종류</th>
            <th>권장 종류</th>
            <th>줄 번호</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, i) => (
            <tr key={`${issue.value}-${i}`}>
              <td>{issue.value}</td>
              <td>&lt;{issue.tagName}&gt;</td>
              <td>{issue.declaredType}</td>
              <td>{issue.detectedType}</td>
              <td>{issue.suggestedType ? <Pill>{issue.suggestedType}</Pill> : "-"}</td>
              <td>
                <LineBadge>{issue.line >= 0 ? issue.line : "-"}</LineBadge>
              </td>
              <td>{issue.message}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </SectionAnchor>
);

// ────────────────────────────────────────────────────────────────────────────
// ④ 순서 비교
// ────────────────────────────────────────────────────────────────────────────
export const OrderSection = ({
  issues,
  sequence,
}: {
  issues: OrderIssue[];
  sequence: OrderSequenceItem[];
}) => (
  <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.order}>
    <SectionTitle>④ 영문 카피덱 순서 vs HTML 노출 순서 비교</SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>카피덱 순서와 HTML 노출 순서가 모두 일치합니다.</EmptyState>
    ) : (
      <>
        <IssueList>
          {issues.map((issue, i) => (
            <li key={i}>{issue.message}</li>
          ))}
        </IssueList>
        <Gap8 />
      </>
    )}
    <details>
      <SequenceSummary>전체 순서 상세 보기 ({sequence.length}건)</SequenceSummary>
      <Table>
        <thead>
          <tr>
            <th>#</th>
            <th>data-copy-set</th>
            <th>HTML 줄 번호</th>
            <th>원문 카피</th>
            <th style={{ minWidth: "9rem" }}>상태</th>
          </tr>
        </thead>
        <tbody>
          {sequence.map((item, i) => (
            <tr key={`${item.value}-${i}`}>
              <td>{i + 1}</td>
              <td>{item.value}</td>
              <td>
                <LineBadge>{item.line >= 0 ? item.line : "-"}</LineBadge>
              </td>
              <td>{item.original_copy}</td>
              <td>
                {item.alreadyMentioned ? (
                  <Pill $tone="neutral">앞에서 언급됨</Pill>
                ) : item.issueType === "deckIdOrder" ? (
                  <Pill>카피덱 순서 오류</Pill>
                ) : item.outOfOrder ? (
                  <Pill>HTML 노출 순서 불일치</Pill>
                ) : (
                  <Pill $tone="ok">정상</Pill>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </details>
  </SectionAnchor>
);

// ────────────────────────────────────────────────────────────────────────────
// ⑤ 카피덱에 없지만 번역이 필요해 보이는 카피
// ────────────────────────────────────────────────────────────────────────────
export const UntaggedCopySection = ({ issues }: { issues: UntaggedCopyIssue[] }) => (
  <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.untagged}>
    <SectionTitle>⑤ 카피덱에 없지만 번역이 필요해 보이는 카피 (title / alt / aria-label)</SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>카피덱에 누락된 번역 대상 카피가 없습니다.</EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>태그</th>
            <th>data-copy-set</th>
            <th>줄 번호</th>
            <th>속성값</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, i) => (
            <tr key={i}>
              <td>{issue.tagNames.map((t) => `<${t}>`).join(", ")}</td>
              <td>
                {issue.values.filter(Boolean).length > 0
                  ? issue.values.filter(Boolean).join(", ")
                  : <Pill>없음</Pill>}
              </td>
              <td>
                <LineBadge>
                  {issue.lines.length > 0
                    ? issue.lines.map((l) => (l >= 0 ? l : "-")).join(", ")
                    : "-"}
                </LineBadge>
              </td>
              <td>{issue.attrText}</td>
              <td>{issue.message}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </SectionAnchor>
);

const StaleState = styled.div`
  padding: 1rem;
  border-radius: 0.5rem;
  background: #fff5eb;
  color: #b35c00;
  font-size: 0.82rem;
  font-weight: 600;
`;

// ────────────────────────────────────────────────────────────────────────────
// ⑥ 미할당(빈 값) 태그 - data-copy-set="" 상태로 남아있는 태그
// ────────────────────────────────────────────────────────────────────────────
export const UnassignedSection = ({
  issues = [],
  count,
}: {
  issues?: UnassignedTagIssue[];
  count?: number;
}) => {
  // unassignedIssues는 나중에 추가된 필드라, 그 이전에 저장된 결과는 개수(count)만 있고
  // 상세 목록(issues)이 비어있을 수 있다. 이 경우 "이상 없음"이 아니라 별도로 안내한다.
  const isStaleData = issues.length === 0 && (count ?? 0) > 0;

  return (
    <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.unassigned}>
      <SectionTitle>⑥ 미할당(빈 값) 태그 (data-copy-set="")</SectionTitle>
      {issues.length === 0 ? (
        isStaleData ? (
          <StaleState>
            ⚠️ 요약상 미할당 태그가 {count}개 있지만, 이 결과는 상세 목록 기능이 추가되기 전에
            저장되어 줄 번호별 목록을 표시할 수 없습니다. "검사 실행" 탭에서 다시 검사한 뒤 저장하면
            상세 목록을 볼 수 있어요.
          </StaleState>
        ) : (
          <EmptyState>data-copy-set 값이 비어있는 태그가 없습니다.</EmptyState>
        )
      ) : (
        <Table>
          <thead>
            <tr>
              <th>태그</th>
              <th>줄 번호</th>
              <th>코드</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((issue, i) => (
              <tr key={i}>
                <td>&lt;{issue.tagName}&gt;</td>
                <td>
                  <LineBadge>{issue.line >= 0 ? issue.line : "-"}</LineBadge>
                </td>
                <td>
                  <CodeSnippet>{issue.snippet}</CodeSnippet>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </SectionAnchor>
  );
};

const IssueList = styled.ul`
  list-style: disc;
  padding-left: 1.2rem;
  font-size: 0.8rem;
  color: #b35c00;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const SequenceSummary = styled.summary`
  cursor: pointer;
  font-size: 0.78rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
`;

const Gap8 = styled.div`
  height: 8px;
`;

// ────────────────────────────────────────────────────────────────────────────
// Schema 검사 (JSON-LD FAQPage / VideoObject)
// ────────────────────────────────────────────────────────────────────────────
export const SchemaCheckSection = ({
  issues,
  totalCount,
  faqCount,
  videoCount,
}: {
  issues: SchemaCheckIssue[];
  totalCount: number;
  faqCount: number;
  videoCount: number;
}) => (
  <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.schema}>
    <SectionTitle>Schema 검사 (JSON-LD FAQPage / VideoObject)</SectionTitle>
    <SchemaCountRow>
      <Pill $tone="neutral">전체 {totalCount}건</Pill>
      <Pill $tone="neutral">FAQ {faqCount}건</Pill>
      <Pill $tone="neutral">Video Object {videoCount}건</Pill>
    </SchemaCountRow>
    <Gap8 />
    {issues.length === 0 ? (
      <EmptyState>schema 관련 이상이 발견되지 않았습니다.</EmptyState>
    ) : (
      <IssueList>
        {issues.map((issue, i) => (
          <li key={i}>{issue.message}</li>
        ))}
      </IssueList>
    )}
  </SectionAnchor>
);

const SchemaCountRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;