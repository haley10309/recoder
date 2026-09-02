// "검사 실행" 탭의 "Schema 검사" 모드 전용 로직.
//
// FAQ/features+disclaimer 검사(analyzePreCoder.ts)는 html의 data-copy-set 태그와
// 업로드된 카피덱(xlsx)을 1:1로 대조하는 구조지만, schema(JSON-LD)는 애초에
// data-copy-set 태그를 쓰지 않고 target_selector/apply_type도 비워두는 별도 체계라
// (extractSchemaDeck.ts 참고) 같은 방식으로 대조할 수 없다.
// 그래서 Schema 검사는 html의 JSON-LD를 직접 추출해, 구조적으로 이상해 보이는
// 부분(빈 카피, FAQ 질문/답변 개수 불일치 등)을 가볍게 짚어주는 정도로 구현한다.

import { extractSchemaDeckFromHtml } from "./extractSchemaDeck";
import type { SchemaDeckRow } from "./extractSchemaDeck";

export type SchemaCheckIssueType = "extract-warning" | "empty-copy" | "faq-qa-mismatch";

export type SchemaCheckIssue = {
  type: SchemaCheckIssueType;
  message: string;
};

export type SchemaCheckResult = {
  rows: SchemaDeckRow[];
  totalCount: number;
  faqCount: number;
  videoCount: number;
  issues: SchemaCheckIssue[];
};

export const analyzeSchemaDeck = (htmlText: string): SchemaCheckResult => {
  const { rows, warnings } = extractSchemaDeckFromHtml(htmlText);

  const issues: SchemaCheckIssue[] = warnings.map((w) => ({
    type: "extract-warning",
    message: w.message,
  }));

  const faqRows = rows.filter((r) => r.category === "FAQ");
  const videoRows = rows.filter((r) => r.category === "Video Object");

  const questionCount = faqRows.filter((r) => r.item === "Questions").length;
  const answerCount = faqRows.filter((r) => r.item === "Answer").length;
  if (questionCount !== answerCount) {
    issues.push({
      type: "faq-qa-mismatch",
      message: `FAQ 질문 수(${questionCount})와 답변 수(${answerCount})가 일치하지 않습니다. 질문마다 답변이 정확히 1개씩 있는지 확인해주세요.`,
    });
  }

  rows.forEach((row) => {
    if (!row.originalCopy || row.originalCopy.trim().length < 2) {
      issues.push({
        type: "empty-copy",
        message: `${row.key} (${row.category} / ${row.item}) 카피가 비어있거나 너무 짧습니다.`,
      });
    }
  });

  return {
    rows,
    totalCount: rows.length,
    faqCount: faqRows.length,
    videoCount: videoRows.length,
    issues,
  };
};
