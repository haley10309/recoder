// Pre Coder 검사 결과를 색상/테두리/강조가 들어간 보기 좋은 엑셀로 내보낸다.
// SheetJS(xlsx)와 API가 동일하되 셀 스타일링을 지원하는 xlsx-js-style을 사용한다.
import * as XLSX from "xlsx-js-style";

import type { PreCoderAnalysisResult } from "./analyzePreCoder";

export type PreCoderExportMeta = {
  title: string;
  htmlFilename: string;
  excelFilename: string;
  createdByName?: string | null;
  createdAt?: string | null;
};

const COLOR = {
  brandDark: "FF32383E",
  brandOrange: "FFFF782F",
  white: "FFFFFFFF",
  successBg: "FFEAFAF0",
  successText: "FF1A7F4B",
  warnBg: "FFFFF3E6",
  warnText: "FFB35C00",
  border: "FFE5E7EB",
  altRow: "FFF9FAFB",
  headText: "FF6B7280",
};

const BORDER = {
  top: { style: "thin", color: { rgb: COLOR.border } },
  bottom: { style: "thin", color: { rgb: COLOR.border } },
  left: { style: "thin", color: { rgb: COLOR.border } },
  right: { style: "thin", color: { rgb: COLOR.border } },
} as const;

const headerCellStyle = {
  fill: { fgColor: { rgb: COLOR.brandDark } },
  font: { bold: true, color: { rgb: COLOR.white }, sz: 11 },
  alignment: { vertical: "center", horizontal: "center", wrapText: true },
  border: BORDER,
};

const bodyCellStyle = (opts: { warn?: boolean; ok?: boolean; alt?: boolean } = {}) => ({
  fill: {
    fgColor: {
      rgb: opts.warn ? COLOR.warnBg : opts.ok ? COLOR.successBg : opts.alt ? COLOR.altRow : COLOR.white,
    },
  },
  font: {
    color: { rgb: opts.warn ? COLOR.warnText : opts.ok ? COLOR.successText : COLOR.brandDark },
    sz: 10,
    bold: !!(opts.warn || opts.ok),
  },
  alignment: { vertical: "top", wrapText: true },
  border: BORDER,
});

const titleStyle = { font: { bold: true, sz: 16, color: { rgb: COLOR.brandDark } } };
const metaLabelStyle = { font: { bold: true, sz: 10, color: { rgb: COLOR.headText } } };
const metaValueStyle = { font: { sz: 10, color: { rgb: COLOR.brandDark } } };
const sectionTitleStyle = { font: { bold: true, sz: 12, color: { rgb: COLOR.brandDark } } };
const successBannerStyle = {
  fill: { fgColor: { rgb: COLOR.successBg } },
  font: { bold: true, sz: 12, color: { rgb: COLOR.successText } },
  alignment: { vertical: "center", horizontal: "left" },
};
const warnBannerStyle = {
  fill: { fgColor: { rgb: COLOR.warnBg } },
  font: { bold: true, sz: 12, color: { rgb: COLOR.warnText } },
  alignment: { vertical: "center", horizontal: "left" },
};
const kpiLabelStyle = {
  fill: { fgColor: { rgb: "FFF9FAFB" } },
  font: { sz: 10, color: { rgb: COLOR.headText } },
  border: BORDER,
  alignment: { vertical: "center" },
};
const kpiValueStyle = (warn: boolean) => ({
  fill: { fgColor: { rgb: warn ? COLOR.warnBg : COLOR.white } },
  font: { bold: true, sz: 12, color: { rgb: warn ? COLOR.warnText : COLOR.brandDark } },
  border: BORDER,
  alignment: { vertical: "center", horizontal: "center" },
});

const setCell = (ws: XLSX.WorkSheet, ref: string, value: any, style?: any) => {
  ws[ref] = { v: value, t: typeof value === "number" ? "n" : "s", s: style };
};

const colLetter = (i: number) => XLSX.utils.encode_col(i);

// ── 요약 시트 ────────────────────────────────────────────────────────────
const buildSummarySheet = (result: PreCoderAnalysisResult, meta: PreCoderExportMeta) => {
  const ws: XLSX.WorkSheet = {};
  let r = 0;

  setCell(ws, `A${r + 1}`, `Pre Coder 검사 결과 - ${meta.title}`, titleStyle);
  ws["!merges"] = [{ s: { r, c: 0 }, e: { r, c: 3 } }];
  r += 2;

  const metaRows: [string, string][] = [
    ["html 파일", meta.htmlFilename],
    ["카피덱 파일", meta.excelFilename],
    ["저장자", meta.createdByName || "-"],
    ["저장 일시", meta.createdAt ? new Date(meta.createdAt).toLocaleString("ko-KR") : "-"],
    ["엑셀 추출 일시", new Date().toLocaleString("ko-KR")],
  ];
  metaRows.forEach(([label, value]) => {
    setCell(ws, `A${r + 1}`, label, metaLabelStyle);
    setCell(ws, `B${r + 1}`, value, metaValueStyle);
    r += 1;
  });
  r += 1;

  const contentMismatchCount = result.contentMismatchIssues?.length ?? 0;
  const supFlagCount = result.supFlagMismatchIssues?.length ?? 0;
  const faqItemCount = result.faqItemMismatchIssues?.length ?? 0;

  const totalIssueCount =
    result.duplicateIssues.length +
    result.scopeIssues.length +
    result.typeMismatchIssues.length +
    result.orderIssues.length +
    result.untaggedCopyIssues.length +
    contentMismatchCount +
    supFlagCount +
    faqItemCount;

  setCell(
    ws,
    `A${r + 1}`,
    totalIssueCount === 0
      ? "✅ recoder 입력 조건을 모두 충족합니다."
      : `⚠️ 총 ${totalIssueCount}건의 이슈가 발견되었습니다.`,
    totalIssueCount === 0 ? successBannerStyle : warnBannerStyle
  );
  ws["!merges"]!.push({ s: { r, c: 0 }, e: { r, c: 3 } });
  r += 2;

  setCell(ws, `A${r + 1}`, "검사 항목 요약", sectionTitleStyle);
  r += 1;

  const kpis: [string, number, boolean][] = [
    ["HTML 내 data-copy-set", result.totalHtmlCopySetCount, false],
    ["카피덱 row 수", result.totalDeckRowCount, false],
    ["① 고유값 위반", result.duplicateIssues.length, result.duplicateIssues.length > 0],
    ["② 태그 스코프 이슈", result.scopeIssues.length, result.scopeIssues.length > 0],
    ["③ 카피 종류 불일치", result.typeMismatchIssues.length, result.typeMismatchIssues.length > 0],
    ["④ 순서 불일치", result.orderIssues.length, result.orderIssues.length > 0],
    ["⑤ 카피덱 누락 카피", result.untaggedCopyIssues.length, result.untaggedCopyIssues.length > 0],
    ["⑥ 미할당(빈 값) 태그", result.unassignedCount, result.unassignedCount > 0],
    ["⑦ 카피 문자열 불일치", contentMismatchCount, contentMismatchCount > 0],
    ["⑧ exclude_sup 불일치", supFlagCount, supFlagCount > 0],
    ["⑨ FAQ item 분류 불일치", faqItemCount, faqItemCount > 0],
  ];
  kpis.forEach(([label, value, warn]) => {
    setCell(ws, `A${r + 1}`, label, kpiLabelStyle);
    setCell(ws, `B${r + 1}`, value, kpiValueStyle(warn));
    r += 1;
  });

  ws["!cols"] = [{ wch: 26 }, { wch: 26 }, { wch: 26 }, { wch: 26 }];
  ws["!ref"] = `A1:D${r + 1}`;
  return ws;
};

// ── 공통: 헤더+데이터 테이블 시트 빌더 ──────────────────────────────────
const buildTableSheet = ({
  headers,
  colWidths,
  rows,
  rowStyler,
  emptyMessage,
}: {
  headers: string[];
  colWidths: number[];
  rows: any[][];
  rowStyler?: (row: any[], rowIndex: number) => any[];
  emptyMessage: string;
}) => {
  const ws: XLSX.WorkSheet = {};

  headers.forEach((h, c) => setCell(ws, `${colLetter(c)}1`, h, headerCellStyle));

  if (rows.length === 0) {
    setCell(ws, "A2", emptyMessage, successBannerStyle);
    ws["!merges"] = [{ s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } }];
    ws["!cols"] = colWidths.map((w) => ({ wch: w }));
    ws["!ref"] = `A1:${colLetter(headers.length - 1)}2`;
    return ws;
  }

  rows.forEach((row, i) => {
    const styles = rowStyler ? rowStyler(row, i) : row.map(() => bodyCellStyle({ alt: i % 2 === 1 }));
    row.forEach((value, c) => {
      setCell(ws, `${colLetter(c)}${i + 2}`, value, styles[c]);
    });
  });

  ws["!cols"] = colWidths.map((w) => ({ wch: w }));
  ws["!autofilter"] = { ref: `A1:${colLetter(headers.length - 1)}1` };
  ws["!ref"] = `A1:${colLetter(headers.length - 1)}${rows.length + 1}`;
  return ws;
};

export const exportPreCoderResultToExcel = (
  result: PreCoderAnalysisResult,
  meta: PreCoderExportMeta
) => {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, buildSummarySheet(result, meta), "요약");

  XLSX.utils.book_append_sheet(
    wb,
    buildTableSheet({
      headers: ["data-copy-set", "중복 횟수", "줄 번호", "설명"],
      colWidths: [16, 10, 20, 70],
      rows: result.duplicateIssues.map((i) => [
        i.value,
        i.count,
        i.lines.map((l) => (l >= 0 ? l : "-")).join(", "),
        i.message,
      ]),
      rowStyler: (row, i) => row.map(() => bodyCellStyle({ warn: true, alt: i % 2 === 1 })),
      emptyMessage: "✅ 서로 다른 카피가 동일한 data-copy-set을 공유하는 경우가 없습니다.",
    }),
    "① 고유값 위반"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildTableSheet({
      headers: ["data-copy-set", "유형", "줄 번호", "설명"],
      colWidths: [16, 22, 10, 80],
      rows: result.scopeIssues.map((i) => [
        i.value,
        i.type === "nested-child"
          ? "부모/자식 중첩"
          : i.type === "child-missing-copyset"
          ? "자식 태그 data-copy-set 누락"
          : "카피덱 값이 HTML에 없음",
        i.line && i.line >= 0 ? i.line : "-",
        i.message,
      ]),
      rowStyler: (row, i) => row.map(() => bodyCellStyle({ warn: true, alt: i % 2 === 1 })),
      emptyMessage: "✅ 태그 스코프 이슈가 없습니다.",
    }),
    "② 태그 스코프"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildTableSheet({
      headers: ["data-copy-set", "태그", "카피덱 지정 종류", "HTML 감지 종류", "권장 종류", "줄 번호", "설명"],
      colWidths: [16, 10, 16, 16, 14, 10, 70],
      rows: result.typeMismatchIssues.map((i) => [
        i.value,
        `<${i.tagName}>`,
        i.declaredType,
        i.detectedType,
        i.suggestedType || "-",
        i.line >= 0 ? i.line : "-",
        i.message,
      ]),
      rowStyler: (row, i) => row.map(() => bodyCellStyle({ warn: true, alt: i % 2 === 1 })),
      emptyMessage: "✅ 카피 종류 불일치가 없습니다.",
    }),
    "③ 카피 종류"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildTableSheet({
      headers: ["#", "data-copy-set", "줄 번호", "원문 카피", "상태"],
      colWidths: [6, 16, 10, 60, 26],
      rows: result.orderSequence.map((item, idx) => [
        idx + 1,
        item.value,
        item.line >= 0 ? item.line : "-",
        item.original_copy || "",
        item.alreadyMentioned
          ? "앞에서 언급됨"
          : item.issueType === "deckIdOrder"
          ? "카피덱 순서 오류"
          : item.outOfOrder
          ? "HTML 노출 순서 불일치"
          : "정상",
      ]),
      rowStyler: (row, i) => {
        const outOfOrder = row[4] === "카피덱 순서 오류" || row[4] === "HTML 노출 순서 불일치";
        return row.map((_, c) => {
          const style = bodyCellStyle({ warn: outOfOrder, alt: i % 2 === 1 });
          // 상태 컬럼(마지막)은 텍스트가 짧으므로 줄바꿈 없이 가운데 정렬한다.
          if (c === row.length - 1) {
            return { ...style, alignment: { vertical: "center", horizontal: "center", wrapText: false } };
          }
          return style;
        });
      },
      emptyMessage: "카피덱과 대조 가능한 순서 정보가 없습니다.",
    }),
    "④ 순서 비교"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildTableSheet({
      headers: ["카피 종류", "태그", "data-copy-set", "줄 번호", "속성값(카피)", "설명"],
      colWidths: [12, 10, 16, 20, 50, 60],
      rows: result.untaggedCopyIssues.map((i) => [
        i.copyKind,
        `<${i.tagNames.join(", ")}>`,
        i.values.filter(Boolean).join(", ") || "없음",
        i.lines.map((l) => (l >= 0 ? l : "-")).join(", "),
        i.attrText,
        i.message,
      ]),
      rowStyler: (row, i) => row.map(() => bodyCellStyle({ warn: true, alt: i % 2 === 1 })),
      emptyMessage: "✅ 카피덱에 누락된 번역 대상 카피가 없습니다.",
    }),
    "⑤ 누락 카피"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildTableSheet({
      headers: ["태그", "줄 번호", "코드 (data-copy-set=\"\")"],
      colWidths: [10, 10, 90],
      rows: result.unassignedIssues.map((i) => [`<${i.tagName}>`, i.line >= 0 ? i.line : "-", i.snippet]),
      rowStyler: (row, i) => row.map(() => bodyCellStyle({ warn: true, alt: i % 2 === 1 })),
      emptyMessage: "✅ data-copy-set 값이 비어있는 태그가 없습니다.",
    }),
    "⑥ 미할당 태그"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildTableSheet({
      headers: ["data-copy-set", "줄 번호", "불일치 위치", "카피덱", "HTML"],
      colWidths: [16, 10, 14, 55, 55],
      rows: (result.contentMismatchIssues ?? []).map((i) => [
        i.value,
        i.line >= 0 ? i.line : "-",
        `${i.diffIndex + 1}번째 글자`,
        i.deckCopy,
        i.htmlCopy,
      ]),
      rowStyler: (row, i) => row.map(() => bodyCellStyle({ warn: true, alt: i % 2 === 1 })),
      emptyMessage: "✅ 카피덱과 HTML의 카피가 모두 일치합니다.",
    }),
    "⑦ 문자열 불일치"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildTableSheet({
      headers: ["data-copy-set", "태그", "줄 번호", "카피덱", "HTML", "설명"],
      colWidths: [16, 10, 10, 16, 14, 60],
      rows: (result.supFlagMismatchIssues ?? []).map((i) => [
        i.value,
        `<${i.tagName}>`,
        i.line >= 0 ? i.line : "-",
        i.declaredExcludeSup ? "exclude_sup = O" : "표시 없음",
        i.hasSupInHtml ? "각주 있음" : "각주 없음",
        i.message,
      ]),
      rowStyler: (row, i) => row.map(() => bodyCellStyle({ warn: true, alt: i % 2 === 1 })),
      emptyMessage: "✅ 각주(sup) 설정이 모두 일치합니다.",
    }),
    "⑧ exclude_sup 불일치"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildTableSheet({
      headers: ["data-copy-set", "줄 번호", "카피덱 item", "HTML 구조상 item", "카피"],
      colWidths: [16, 10, 16, 18, 60],
      rows: (result.faqItemMismatchIssues ?? []).map((i) => [
        i.value,
        i.line >= 0 ? i.line : "-",
        i.deckItem,
        i.detectedItem,
        i.copyPreview,
      ]),
      rowStyler: (row, i) => row.map(() => bodyCellStyle({ warn: true, alt: i % 2 === 1 })),
      emptyMessage: "✅ 카피덱의 item 분류가 HTML 구조와 모두 일치합니다.",
    }),
    "⑨ FAQ item 불일치"
  );

  const safeTitle = meta.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
  XLSX.writeFile(wb, `PreCoder_${safeTitle}_${Date.now()}.xlsx`);
};
