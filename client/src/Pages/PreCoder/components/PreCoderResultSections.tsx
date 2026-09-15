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
  ContentMismatchIssue,
  SupFlagMismatchIssue,
  FaqItemMismatchIssue,
} from "../utils/analyzePreCoder";
import type {
  SchemaCheckIssue,
  SchemaDeckCompareIssue,
  SchemaDuplicateKeyIssue,
} from "../utils/analyzeSchemaDeck";

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
  contentMismatch: "precoder-section-content-mismatch",
  supFlag: "precoder-section-sup-flag",
  faqItem: "precoder-section-faq-item",
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
    <SectionTitle>
      ⑤ 카피덱에 없지만 번역이 필요해 보이는 카피 (alt / aria-label / disclaimer / title / innerText)
    </SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>카피덱에 누락된 번역 대상 카피가 없습니다.</EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>카피 종류</th>
            <th>태그</th>
            <th>data-copy-set</th>
            <th>줄 번호</th>
            <th>속성값 / 카피</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, i) => (
            <tr key={i}>
              <td>
                <Pill>{issue.copyKind}</Pill>
              </td>
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

// ────────────────────────────────────────────────────────────────────────────
// ⑦ 카피덱 <-> HTML 문자열 일치 검사 (글자 단위 불일치 지점 강조)
// ────────────────────────────────────────────────────────────────────────────
const DiffText = ({ text, diffIndex }: { text: string; diffIndex: number }) => (
  <DiffWrap>
    <span>{text.slice(0, diffIndex)}</span>
    <DiffMark>{text.slice(diffIndex, diffIndex + 1) || "∅"}</DiffMark>
    <span>{text.slice(diffIndex + 1)}</span>
  </DiffWrap>
);

export const ContentMismatchSection = ({ issues = [] }: { issues?: ContentMismatchIssue[] }) => (
  <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.contentMismatch}>
    <SectionTitle>⑦ 카피덱 ↔ HTML 문자열 일치 검사</SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>카피덱과 HTML의 카피가 모두 일치합니다.</EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>data-copy-set</th>
            <th>줄 번호</th>
            <th style={{ minWidth: "7rem" }}>불일치 위치</th>
            <th>카피덱</th>
            <th>HTML</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, i) => (
            <tr key={i}>
              <td>{issue.value}</td>
              <td>
                <LineBadge>{issue.line >= 0 ? issue.line : "-"}</LineBadge>
              </td>
              <td>
                <Pill>{issue.diffIndex + 1}번째 글자</Pill>
              </td>
              <td>
                <DiffText text={issue.deckCopy} diffIndex={issue.diffIndex} />
              </td>
              <td>
                <DiffText text={issue.htmlCopy} diffIndex={issue.diffIndex} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </SectionAnchor>
);

const DiffWrap = styled.div`
  font-family: "SFMono-Regular", Consolas, monospace;
  font-size: 0.72rem;
  line-height: 1.5;
  word-break: break-all;
  white-space: pre-wrap;
`;

const DiffMark = styled.span`
  background: #ffd8ad;
  color: #b35c00;
  font-weight: 700;
  border-radius: 2px;
  padding: 0 1px;
`;

// ────────────────────────────────────────────────────────────────────────────
// ⑧ exclude_sup / enable_text_transform 일치 검사
// ────────────────────────────────────────────────────────────────────────────
export const SupFlagSection = ({ issues = [] }: { issues?: SupFlagMismatchIssue[] }) => (
  <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.supFlag}>
    <SectionTitle>⑧ exclude_sup / enable_text_transform 일치 검사</SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>카피덱의 각주 설정과 HTML의 각주(sup) 유무가 모두 일치합니다.</EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>data-copy-set</th>
            <th>태그</th>
            <th>줄 번호</th>
            <th style={{ minWidth: "7rem" }}>카피덱</th>
            <th style={{ minWidth: "7rem" }}>HTML</th>
            <th>설명</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, i) => (
            <tr key={i}>
              <td>{issue.value}</td>
              <td>&lt;{issue.tagName}&gt;</td>
              <td>
                <LineBadge>{issue.line >= 0 ? issue.line : "-"}</LineBadge>
              </td>
              <td>
                <Pill $tone={issue.declaredExcludeSup ? "neutral" : undefined}>
                  {issue.declaredExcludeSup ? "exclude_sup = O" : "표시 없음"}
                </Pill>
              </td>
              <td>
                <Pill $tone={issue.hasSupInHtml ? "neutral" : undefined}>
                  {issue.hasSupInHtml ? "각주 있음" : "각주 없음"}
                </Pill>
              </td>
              <td>{issue.message}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </SectionAnchor>
);

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
  hasDeck = false,
  deckRowCount = 0,
  duplicateKeyIssues = [],
  compareIssues = [],
}: {
  issues: SchemaCheckIssue[];
  totalCount: number;
  faqCount: number;
  videoCount: number;
  hasDeck?: boolean;
  deckRowCount?: number;
  duplicateKeyIssues?: SchemaDuplicateKeyIssue[];
  compareIssues?: SchemaDeckCompareIssue[];
}) => {
  // 카피덱 대조 이슈는 표로 따로 보여주므로, 하단 목록에서는 중복 노출하지 않는다.
  const compareTypes = new Set([
    "duplicate-key",
    "category-mismatch",
    "item-mismatch",
    "content-mismatch",
    "deck-not-in-html",
    "html-not-in-deck",
  ]);
  const structuralIssues = issues.filter((i) => !compareTypes.has(i.type));

  const typeLabel: Record<SchemaDeckCompareIssue["type"], string> = {
    "category-mismatch": "category 불일치",
    "item-mismatch": "item 불일치",
    "content-mismatch": "문자열 불일치",
    "deck-not-in-html": "html에 없음",
    "html-not-in-deck": "카피덱에 없음",
  };

  return (
    <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.schema}>
      <SectionTitle>Schema 검사 (JSON-LD FAQPage / VideoObject)</SectionTitle>
      <SchemaCountRow>
        <Pill $tone="neutral">html schema {totalCount}건</Pill>
        <Pill $tone="neutral">FAQ {faqCount}건</Pill>
        <Pill $tone="neutral">Video Object {videoCount}건</Pill>
        {hasDeck && <Pill $tone="neutral">카피덱 {deckRowCount}행</Pill>}
      </SchemaCountRow>
      <Gap8 />

      {!hasDeck && (
        <>
          <StaleState>
            ℹ️ schema 카피덱(xlsx)을 함께 업로드하면 고유값 위반 / category·item 분류 / 카피 문자열
            일치 여부까지 대조 검사합니다. 지금은 html 자체 구조 점검만 수행했습니다.
          </StaleState>
          <Gap8 />
        </>
      )}

      {hasDeck && (
        <>
          <SubTitle>(1) 고유값 위반 (카피덱 Key 중복)</SubTitle>
          {duplicateKeyIssues.length === 0 ? (
            <EmptyState>중복된 Key가 없습니다.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>중복 횟수</th>
                  <th>설명</th>
                </tr>
              </thead>
              <tbody>
                {duplicateKeyIssues.map((issue, i) => (
                  <tr key={i}>
                    <td>{issue.key}</td>
                    <td>{issue.count}</td>
                    <td>{issue.message}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <Gap8 />

          <SubTitle>(2)~(4) 카피덱 ↔ html schema 대조</SubTitle>
          {compareIssues.length === 0 ? (
            <EmptyState>
              category / item 분류와 카피 문자열이 html schema와 모두 일치합니다.
            </EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th style={{ minWidth: "7rem" }}>유형</th>
                  <th>카피덱</th>
                  <th>html schema</th>
                </tr>
              </thead>
              <tbody>
                {compareIssues.map((issue, i) => (
                  <tr key={i}>
                    <td>{issue.key}</td>
                    <td>
                      <Pill>{typeLabel[issue.type]}</Pill>
                      {issue.type === "content-mismatch" && issue.diffIndex !== undefined && (
                        <>
                          <br />
                          <LineBadge>{issue.diffIndex + 1}번째 글자</LineBadge>
                        </>
                      )}
                    </td>
                    <td>
                      {issue.type === "content-mismatch" && issue.diffIndex !== undefined ? (
                        <DiffText text={issue.deckValue} diffIndex={issue.diffIndex} />
                      ) : (
                        issue.deckValue || "-"
                      )}
                    </td>
                    <td>
                      {issue.type === "content-mismatch" && issue.diffIndex !== undefined ? (
                        <DiffText text={issue.htmlValue} diffIndex={issue.diffIndex} />
                      ) : (
                        issue.htmlValue || "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <Gap8 />
        </>
      )}

      <SubTitle>html schema 자체 점검</SubTitle>
      {structuralIssues.length === 0 ? (
        <EmptyState>schema 구조 관련 이상이 발견되지 않았습니다.</EmptyState>
      ) : (
        <IssueList>
          {structuralIssues.map((issue, i) => (
            <li key={i}>{issue.message}</li>
          ))}
        </IssueList>
      )}
    </SectionAnchor>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// ⑨ FAQ item 종류(Questions / Answer) 일치 검사
// ────────────────────────────────────────────────────────────────────────────
export const FaqItemSection = ({ issues = [] }: { issues?: FaqItemMismatchIssue[] }) => (
  <SectionAnchor id={PRE_CODER_SECTION_ANCHORS.faqItem}>
    <SectionTitle>⑨ FAQ item 종류 일치 검사 (Questions / Answer)</SectionTitle>
    {issues.length === 0 ? (
      <EmptyState>카피덱의 item 분류가 HTML 구조와 모두 일치합니다.</EmptyState>
    ) : (
      <Table>
        <thead>
          <tr>
            <th>data-copy-set</th>
            <th>줄 번호</th>
            <th style={{ minWidth: "7rem" }}>카피덱</th>
            <th style={{ minWidth: "7rem" }}>HTML 구조</th>
            <th>카피</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, i) => (
            <tr key={i}>
              <td>{issue.value}</td>
              <td>
                <LineBadge>{issue.line >= 0 ? issue.line : "-"}</LineBadge>
              </td>
              <td>
                <Pill>{issue.deckItem}</Pill>
              </td>
              <td>
                <Pill $tone="ok">{issue.detectedItem}</Pill>
              </td>
              <td>{issue.copyPreview}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    )}
  </SectionAnchor>
);

const SubTitle = styled.h4`
  font-size: 12px;
  font-weight: 700;
  color: #4b5563;
  margin: 0.6rem 0 0.4rem;
`;

const SchemaCountRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;
