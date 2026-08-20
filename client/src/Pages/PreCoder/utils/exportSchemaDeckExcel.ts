import * as XLSX from "xlsx-js-style";

import type { SchemaDeckRow } from "./extractSchemaDeck";

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

const setCell = (ws: XLSX.WorkSheet, ref: string, value: unknown, style?: any) => {
  ws[ref] = {
    v: value ?? "",
    t: typeof value === "number" ? "n" : "s",
    s: style,
  };
};

const colLetter = (index: number) => XLSX.utils.encode_col(index);

export const exportSchemaDeckExcel = (rows: SchemaDeckRow[], title: string) => {
  // CA_FR은 로컬 법인이 작성하는 번역 영역이므로 항상 고정해서 비워 둔다.
  const localeCodes = ["CA_FR"];

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
  const fixedColWidths = [16, 24, 14, 12, 20, 16, 16, 70, 36];
  const colWidths = [...fixedColWidths, ...localeCodes.map(() => 50)];

  const ws: XLSX.WorkSheet = {};

  headers.forEach((header, columnIndex) => {
    setCell(ws, `${colLetter(columnIndex)}1`, header, headerCellStyle);
  });

  rows.forEach((row, rowIndex) => {
    const fixedValues = [
      row.key,
      row.targetSelector,
      row.applyType,
      row.excludeSup ? "O" : "",
      row.enableTextTransform ? "O" : "",
      row.category,
      row.item,
      row.originalCopy,
      "",
    ];

    const localeValues = localeCodes.map((code) => row.locales?.[code] ?? "");
    const values = [...fixedValues, ...localeValues];
    const style = bodyCellStyle(rowIndex % 2 === 1);

    values.forEach((value, columnIndex) => {
      setCell(ws, `${colLetter(columnIndex)}${rowIndex + 2}`, value, style);
    });
  });

  const lastColumn = colLetter(headers.length - 1);
  ws["!cols"] = colWidths.map((wch) => ({ wch }));
  ws["!autofilter"] = { ref: `A1:${lastColumn}1` };
  ws["!ref"] = `A1:${lastColumn}${rows.length + 1}`;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Schema recoder input");

  const safeTitle = title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 80);
  XLSX.writeFile(
    wb,
    `Schema_recoder_input_${safeTitle}_${Date.now()}.xlsx`
  );
};
