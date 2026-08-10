// FAQ 정제 결과(exportRows)를 recoder 입력 포맷 엑셀로 내보낸다.
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
  const headers = [
    "Key",
    "target_selector",
    "apply_type",
    "exclude_sup",
    "enable_text_transform",
    "Category",
    "Item",
    "Copy",
    "Remark",
  ];
  const colWidths = [10, 20, 12, 12, 20, 14, 12, 60, 30];

  const ws: XLSX.WorkSheet = {};
  headers.forEach((h, c) => setCell(ws, `${colLetter(c)}1`, h, headerCellStyle));

  rows.forEach((row, i) => {
    const values = [
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
