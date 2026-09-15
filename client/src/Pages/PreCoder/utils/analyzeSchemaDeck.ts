// "검사 실행" 탭의 "Schema 검사" 모드 전용 로직.
//
// FAQ/features+disclaimer 검사(analyzePreCoder.ts)는 html의 data-copy-set 태그와
// 업로드된 카피덱(xlsx)을 1:1로 대조하는 구조지만, schema(JSON-LD)는 애초에
// data-copy-set 태그를 쓰지 않고 target_selector/apply_type도 비워두는 별도 체계라
// (extractSchemaDeck.ts 참고) 같은 방식으로 대조할 수 없다.
//
// 그래서 Schema 검사는 html의 JSON-LD에서 직접 추출한 "정답 카피덱"과, 사용자가 업로드한
// schema 카피덱을 Key 기준으로 맞대어 아래 항목을 검사한다.
//   (1) 고유값 위반        : 카피덱 Key 중복
//   (2) category 불일치    : Video Object / FAQ 분류가 html 기준과 다른 경우
//   (3) item 종류 불일치   : Name / Description / Questions / Answer 분류가 다른 경우
//   (4) 문자열 불일치      : 1글자만 달라도 몇 번째 글자부터 다른지 표시
// 카피덱을 올리지 않으면 html 자체 구조 점검(빈 카피, 질문/답변 개수)만 수행한다.

import { extractSchemaDeckFromHtml } from "./extractSchemaDeck";
import type { SchemaDeckRow } from "./extractSchemaDeck";

export type SchemaCheckIssueType =
  | "extract-warning"
  | "empty-copy"
  | "faq-qa-mismatch"
  | "duplicate-key"
  | "category-mismatch"
  | "item-mismatch"
  | "content-mismatch"
  | "deck-not-in-html"
  | "html-not-in-deck";

export type SchemaCheckIssue = {
  type: SchemaCheckIssueType;
  message: string;
};

// 카피덱 <-> html 대조 상세 (표로 보여주기 위한 구조)
export type SchemaDeckCompareIssue = {
  key: string;
  type: "category-mismatch" | "item-mismatch" | "content-mismatch" | "deck-not-in-html" | "html-not-in-deck";
  deckValue: string;
  htmlValue: string;
  diffIndex?: number; // content-mismatch일 때만
  message: string;
};

export type SchemaDuplicateKeyIssue = {
  key: string;
  count: number;
  message: string;
};

export type SchemaCheckResult = {
  rows: SchemaDeckRow[];
  totalCount: number;
  faqCount: number;
  videoCount: number;
  issues: SchemaCheckIssue[];
  // 카피덱을 함께 올린 경우에만 채워진다
  hasDeck: boolean;
  deckRowCount: number;
  duplicateKeyIssues: SchemaDuplicateKeyIssue[];
  compareIssues: SchemaDeckCompareIssue[];
};

// 업로드된 schema 카피덱의 한 행 (엑셀 파싱 결과를 이 형태로 넘겨받는다)
export type SchemaCopyDeckRow = {
  key: string;
  category: string;
  item: string;
  copy: string;
};

const normalize = (v: string | null | undefined): string =>
  (v ?? "").normalize("NFC").replace(/\s+/g, " ").trim();

// 비교용: 대소문자/공백 차이는 무시 (category, item 같은 분류값 비교에 사용)
const normalizeLoose = (v: string | null | undefined): string =>
  normalize(v).toLowerCase().replace(/[\s_-]/g, "");

const findFirstDiffIndex = (a: string, b: string): number => {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return i;
  }
  return len;
};

const excerptAround = (text: string, index: number, radius = 20): string => {
  const start = Math.max(0, index - radius);
  const end = Math.min(text.length, index + radius);
  return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
};

export const analyzeSchemaDeck = (
  htmlText: string,
  deckRows?: SchemaCopyDeckRow[]
): SchemaCheckResult => {
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

  const duplicateKeyIssues: SchemaDuplicateKeyIssue[] = [];
  const compareIssues: SchemaDeckCompareIssue[] = [];
  const hasDeck = !!deckRows && deckRows.length > 0;

  if (hasDeck) {
    const deck = deckRows as SchemaCopyDeckRow[];

    // ── (1) 고유값 위반: 카피덱 Key 중복
    const keyCounts = new Map<string, number>();
    deck.forEach((row) => {
      const key = normalize(row.key);
      if (!key) return;
      keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1);
    });
    keyCounts.forEach((count, key) => {
      if (count <= 1) return;
      duplicateKeyIssues.push({
        key,
        count,
        message: `카피덱에서 Key "${key}"가 ${count}번 중복 사용되었습니다. Key는 고유해야 합니다.`,
      });
      issues.push({
        type: "duplicate-key",
        message: `카피덱에서 Key "${key}"가 ${count}번 중복 사용되었습니다.`,
      });
    });

    // ── html 기준 정답 카피덱을 Key로 인덱싱
    const htmlByKey = new Map<string, SchemaDeckRow>();
    rows.forEach((r) => htmlByKey.set(normalize(r.key), r));

    const seenDeckKeys = new Set<string>();

    deck.forEach((row) => {
      const key = normalize(row.key);
      if (!key) return;
      seenDeckKeys.add(key);

      const htmlRow = htmlByKey.get(key);
      if (!htmlRow) {
        const msg = `카피덱의 Key "${key}"에 해당하는 항목을 html의 schema(JSON-LD)에서 찾지 못했습니다.`;
        compareIssues.push({
          key,
          type: "deck-not-in-html",
          deckValue: normalize(row.copy),
          htmlValue: "",
          message: msg,
        });
        issues.push({ type: "deck-not-in-html", message: msg });
        return;
      }

      // ── (2) category 불일치 (Video Object / FAQ)
      if (normalizeLoose(row.category) !== normalizeLoose(htmlRow.category)) {
        const msg = `${key}: category가 카피덱에는 "${row.category}"로 되어 있지만, html schema 기준으로는 "${htmlRow.category}"입니다.`;
        compareIssues.push({
          key,
          type: "category-mismatch",
          deckValue: normalize(row.category),
          htmlValue: htmlRow.category,
          message: msg,
        });
        issues.push({ type: "category-mismatch", message: msg });
      }

      // ── (3) item 종류 불일치 (Name / Description / Questions / Answer)
      if (normalizeLoose(row.item) !== normalizeLoose(htmlRow.item)) {
        const msg = `${key}: item이 카피덱에는 "${row.item}"로 되어 있지만, html schema 기준으로는 "${htmlRow.item}"입니다.`;
        compareIssues.push({
          key,
          type: "item-mismatch",
          deckValue: normalize(row.item),
          htmlValue: htmlRow.item,
          message: msg,
        });
        issues.push({ type: "item-mismatch", message: msg });
      }

      // ── (4) 문자열 일치 여부 (1글자만 달라도 위치 표시)
      const deckCopy = normalize(row.copy);
      const htmlCopy = normalize(htmlRow.originalCopy);
      if (deckCopy && htmlCopy && deckCopy !== htmlCopy) {
        const diffIndex = findFirstDiffIndex(deckCopy, htmlCopy);
        const msg = `${key}: 카피덱과 html schema의 카피가 ${diffIndex + 1}번째 글자부터 다릅니다. (카피덱: "${excerptAround(deckCopy, diffIndex)}" / html: "${excerptAround(htmlCopy, diffIndex)}")`;
        compareIssues.push({
          key,
          type: "content-mismatch",
          deckValue: deckCopy,
          htmlValue: htmlCopy,
          diffIndex,
          message: msg,
        });
        issues.push({ type: "content-mismatch", message: msg });
      }
    });

    // html에는 있는데 카피덱에 없는 항목 (번역 누락 위험)
    rows.forEach((htmlRow) => {
      const key = normalize(htmlRow.key);
      if (seenDeckKeys.has(key)) return;
      const msg = `html schema의 ${key} (${htmlRow.category} / ${htmlRow.item}) 항목이 카피덱에 없습니다. 번역에서 누락될 수 있습니다.`;
      compareIssues.push({
        key,
        type: "html-not-in-deck",
        deckValue: "",
        htmlValue: normalize(htmlRow.originalCopy),
        message: msg,
      });
      issues.push({ type: "html-not-in-deck", message: msg });
    });
  }

  return {
    rows,
    totalCount: rows.length,
    faqCount: faqRows.length,
    videoCount: videoRows.length,
    issues,
    hasDeck,
    deckRowCount: deckRows?.length ?? 0,
    duplicateKeyIssues,
    compareIssues,
  };
};
