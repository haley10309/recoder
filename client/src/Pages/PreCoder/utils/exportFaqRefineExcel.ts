// FAQ 정제 결과(exportRows)를 recoder 입력 포맷 엑셀로 내보낸다.
// V 마커 오른쪽의 로컬 국가 컬럼들은 원본 그대로 뒤에 이어붙인다.
import * as XLSX from "xlsx-js-style";

import type { FaqExportRow } from "./refineFaqHtml";

const COLOR = {
  brandDark: "FF32383E",
  white: "FFFFFFFF",
  altRow: "FFF9FAFB",
  border: "FFE5E7EB",
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

export const exportFaqRefineExcel = (rows: FaqExportRow[], title: string) => {
  // 모든 row의 locales 키를 모아서 등장한 순서대로 로컬 국가 컬럼 목록을 만든다.
  const localeCodes: string[] = [];
  rows.forEach((row) => {
    Object.keys(row.locales || {}).forEach((code) => {
      if (!localeCodes.includes(code)) localeCodes.push(code);
    });
  });

  const fixedHeaders = [
    "Key",
    "target_selector",
    "apply_type",
    "exclude_sup",
    "enable_text_transform",
    "Category",
    "Item",
    "original_copy",
    "Remark",
  ];
  const headers = [...fixedHeaders, ...localeCodes];

  const fixedColWidths = [10, 20, 12, 12, 20, 14, 12, 60, 30];
  const colWidths = [...fixedColWidths, ...localeCodes.map(() => 40)];

  const ws: XLSX.WorkSheet = {};
  headers.forEach((h, c) => setCell(ws, `${colLetter(c)}1`, h, headerCellStyle));

  rows.forEach((row, i) => {
    const fixedValues = [
      row.key,
      row.targetSelector,
      row.applyType,
      row.excludeSup ? "O" : "",
      row.enableTextTransform ? "O" : "",
      row.category,
      row.item,
      row.copy,
      row.remark,
    ];
    const localeValues = localeCodes.map((code) => row.locales?.[code] ?? "");
    const values = [...fixedValues, ...localeValues];

    const style = bodyCellStyle(i % 2 === 1);
    values.forEach((v, c) => setCell(ws, `${colLetter(c)}${i + 2}`, v, style));
  });

  ws["!cols"] = colWidths.map((w) => ({ wch: w }));
  ws["!autofilter"] = { ref: `A1:${colLetter(headers.length - 1)}1` };
  ws["!ref"] = `A1:${colLetter(headers.length - 1)}${rows.length + 1}`;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "FAQ recoder input");

  const safeTitle = title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
  XLSX.writeFile(wb, `FAQ_recoder_input_${safeTitle}_${Date.now()}.xlsx`);
};