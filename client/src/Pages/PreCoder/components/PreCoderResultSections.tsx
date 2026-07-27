import React from "react";
import styled from "styled-components";

import type {
  DuplicateIssue,
  ScopeIssue,
  TypeMismatchIssue,
  OrderIssue,
  OrderSequenceItem,
  UntaggedCopyIssue,
} from "../utils/analyzePreCoder";

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

const Pill = styled.span<{ $tone?: "warn" | "ok" }>`
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  background: ${({ $tone }) => ($tone === "ok" ? "#eafaf0" : "#fff0e0")};
  color: ${({ $tone }) => ($tone === "ok" ? "#1a7f4b" : "#d1691a")};
`;

const LineBadge = styled.span`
  font-family: monospace;
  color: #6b7280;
`;

// ────────────────────────────────────────────────────────────────────────────
// ① 고유값 검사
// ────────────────────────────────────────────────────────────────────────────
export const DuplicateSection = ({ issues }: { issues: DuplicateIssue[] }) => (
  <div>
    <SectionTitle>① data-copy-set 고유값 검사</SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>중복 사용된 data-copy-set이 없습니다.</EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>data-copy-set</th>
            <th>중복 횟수</th>
            <th>줄 번호</th>
            <th>내용 일치 여부</th>
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
              <td>
                <Pill $tone={issue.contentsMatch ? "warn" : undefined}>
                  {issue.contentsMatch ? "동일 내용 중복" : "서로 다른 카피 충돌"}
                </Pill>
              </td>
              <td>{issue.message}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// ② 태그 스코프 검사
// ────────────────────────────────────────────────────────────────────────────
export const ScopeSection = ({ issues }: { issues: ScopeIssue[] }) => (
  <div>
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
                  {issue.type === "nested-child" ? "부모/자식 중첩" : "카피덱 값이 HTML에 없음"}
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
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// ③ 카피 종류 자동 분류 검사
// ────────────────────────────────────────────────────────────────────────────
export const TypeMismatchSection = ({ issues }: { issues: TypeMismatchIssue[] }) => (
  <div>
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
  </div>
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
  <div>
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
            <th>상태</th>
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
                {item.outOfOrder ? (
                  <Pill>순서 뒤바뀜</Pill>
                ) : (
                  <Pill $tone="ok">정상</Pill>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </details>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// ⑤ 카피덱에 없지만 번역이 필요해 보이는 카피
// ────────────────────────────────────────────────────────────────────────────
export const UntaggedCopySection = ({ issues }: { issues: UntaggedCopyIssue[] }) => (
  <div>
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
              <td>&lt;{issue.tagName}&gt;</td>
              <td>{issue.value || <Pill>없음</Pill>}</td>
              <td>
                <LineBadge>{issue.line >= 0 ? issue.line : "-"}</LineBadge>
              </td>
              <td>{issue.attrText}</td>
              <td>{issue.message}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </div>
);

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
