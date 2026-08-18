import { useState } from "react";

import { extractFaqCopyDeck } from "@/apis/preCoderFaqApis";
import { refineFaqHtml } from "../utils/refineFaqHtml";
import type { FaqExportRow, FaqRefineWarning } from "../utils/refineFaqHtml";
import { exportFaqRefineExcel } from "../utils/exportFaqRefineExcel";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
};

export function useFaqRefine({
  htmlFile,
  htmlFileName,
  excelFile,
}: {
  htmlFile: File | null;
  htmlFileName: string;
  excelFile: File | null;
}) {
  const [prefix, setPrefix] = useState("");
  const [status, setStatus] = useState<"" | "loading" | "success" | "fail">("");
  const [refinedHtml, setRefinedHtml] = useState<string | null>(null);
  const [exportRows, setExportRows] = useState<FaqExportRow[]>([]);
  const [warnings, setWarnings] = useState<FaqRefineWarning[]>([]);
  const [localeCodes, setLocaleCodes] = useState<string[]>([]);

  const handleRun = async () => {
    if (!htmlFile || !excelFile) {
      alert("FAQ html 파일과 카피덱(xlsx) 파일을 모두 업로드 해주세요.");
      return;
    }
    if (!prefix.trim()) {
      alert('새로 부여할 data-copy-set 접두사를 입력해주세요. (예: "SC1")');
      return;
    }

    try {
      setStatus("loading");
      const [htmlText, deckExtract] = await Promise.all([
        readFileAsText(htmlFile),
        extractFaqCopyDeck(excelFile),
      ]);

      if (!deckExtract.rows || deckExtract.rows.length === 0) {
        setStatus("fail");
        alert("카피덱(xlsx)에서 데이터를 읽어오지 못했습니다. 파일 형식을 확인해주세요.");
        return;
      }

      const result = refineFaqHtml(htmlText, deckExtract.rows, prefix.trim());
      setRefinedHtml(result.html);
      setExportRows(result.exportRows);
      setWarnings(result.warnings);
      setLocaleCodes(deckExtract.localeColumns.map((c) => c.code));
      setStatus("success");
    } catch (error) {
      console.error("[useFaqRefine] 에러", error);
      setStatus("fail");
    }
  };

  const handleDownloadHtml = () => {
    if (!refinedHtml) return;
    const blob = new Blob([refinedHtml], { type: "text/html;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const baseName = (htmlFileName || "faq").replace(/\.html?$/i, "");
    link.download = `${baseName}_tagged.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    if (exportRows.length === 0) return;
    exportFaqRefineExcel(exportRows, htmlFileName || "faq");
  };

  const resetRefine = () => {
    setRefinedHtml(null);
    setExportRows([]);
    setWarnings([]);
    setLocaleCodes([]);
    setStatus("");
  };

  return {
    prefix,
    setPrefix,
    status,
    refinedHtml,
    exportRows,
    warnings,
    localeCodes,
    handleRun,
    handleDownloadHtml,
    handleDownloadExcel,
    resetRefine,
  };
}
