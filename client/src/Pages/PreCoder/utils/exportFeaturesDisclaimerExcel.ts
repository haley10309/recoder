// features + disclaimer 정제 결과(exportRows)를 recoder 입력 포맷 엑셀로 내보낸다.
// 시트 구성:
//   1) "Features+Disclaimer" - 추출된 전체 항목 (기존에 data-copy-set이 있던 것 + 이번에 새로 배정한 것)
//   2) "신규 배정분(Custom)" - 이번에 새로 커스텀 배정한 항목만 별도로 모아 검수하기 쉽게 함
import * as XLSX from "xlsx-js-style";

import type { FeatureDisclaimerExportRow } from "./extractFeaturesDisclaimer";

const COLOR = {
  brandDark: "FF32383E",
  white: "FFFFFFFF",
  altRow: "FFF9FAFB",
  border: "FFE5E7EB",
  customHeader: "FFB35C00",
};

const BORDER = {
  top: { style: "thin", color: { rgb: COLOR.border } },
  bottom: { style: "thin", color: { rgb: COLOR.border } },
  left: { style: "thin", color: { rgb: COLOR.border } },
  right: { style: "thin", color: { rgb: COLOR.border } },
} as const;

const headerCellStyle = (bg: string = COLOR.brandDark) => ({
  fill: { fgColor: { rgb: bg } },
  font: { bold: true, color: { rgb: COLOR.white }, sz: 11 },
  alignment: { vertical: "center", horizontal: "center", wrapText: true },
  border: BORDER,
});

const bodyCellStyle = (alt: boolean) => ({
  fill: { fgColor: { rgb: alt ? COLOR.altRow : COLOR.white } },
  font: { sz: 10, color: { rgb: COLOR.brandDark } },
  alignment: { vertical: "top", wrapText: true },
  border: BORDER,
});

const setCell = (ws: XLSX.WorkSheet, ref: string, value: any, style?: any) => {
  ws[ref] = { v: value, t: typeof value === "number" ? "n" : "s", s: style };
};

const colLetter = (i: number) => XLSX.utils.encode_col(i);

const HEADERS = [
  "Key",
  "target_selector",
  "apply_type",
  "Category",
  "Item",
  "original_copy",
  "신규 배정 여부",
];

const buildSheet = (rows: FeatureDisclaimerExportRow[], headerBg?: string): XLSX.WorkSheet => {
  const ws: XLSX.WorkSheet = {};
  const colWidths = [12, 22, 12, 18, 14, 60, 14];

  HEADERS.forEach((h, c) => setCell(ws, `${colLetter(c)}1`, h, headerCellStyle(headerBg)));

  rows.forEach((row, i) => {
    const values = [
      row.key,
      row.targetSelector,
      row.applyType,
      row.category,
      row.item,
      row.copy,
      row.isCustom ? "O (신규)" : "",
    ];
    const style = bodyCellStyle(i % 2 === 1);
    values.forEach((v, c) => setCell(ws, `${colLetter(c)}${i + 2}`, v, style));
  });

  ws["!cols"] = colWidths.map((w) => ({ wch: w }));
  ws["!autofilter"] = { ref: `A1:${colLetter(HEADERS.length - 1)}1` };
  ws["!ref"] = `A1:${colLetter(HEADERS.length - 1)}${Math.max(rows.length, 0) + 1}`;

  return ws;
};

export const exportFeaturesDisclaimerExcel = (
  allRows: FeatureDisclaimerExportRow[],
  customRows: FeatureDisclaimerExportRow[],
  title: string
) => {
  const wb = XLSX.utils.book_new();

  const mainSheet = buildSheet(allRows);
  XLSX.utils.book_append_sheet(wb, mainSheet, "Features+Disclaimer");

  const customSheet = buildSheet(customRows, COLOR.customHeader);
  XLSX.utils.book_append_sheet(wb, customSheet, "신규 배정분(Custom)");

  const safeTitle = title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
  XLSX.writeFile(wb, `Features_Disclaimer_recoder_input_${safeTitle}_${Date.now()}.xlsx`);
};
