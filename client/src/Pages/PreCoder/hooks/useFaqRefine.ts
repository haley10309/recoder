import { useState } from "react";

import { extractFaqCopyDeck } from "@/apis/preCoderFaqApis";
import { refineFaqHtml, extractFaqFromHtml } from "../utils/refineFaqHtml";
import type { FaqExportRow, FaqRefineWarning } from "../utils/refineFaqHtml";
import { exportFaqRefineExcel } from "../utils/exportFaqRefineExcel";
import { extractSchemaDeckFromHtml } from "../utils/extractSchemaDeck";
import { exportSchemaDeckExcel } from "../utils/exportSchemaDeckExcel";
import type { SchemaDeckRow, SchemaDeckWarning } from "../utils/extractSchemaDeck";
import { extractFeaturesDisclaimerFromHtml } from "../utils/extractFeaturesDisclaimer";
import { exportFeaturesDisclaimerExcel } from "../utils/exportFeaturesDisclaimerExcel";
import type {
  FeatureDisclaimerExportRow,
  FeatureDisclaimerWarning,
} from "../utils/extractFeaturesDisclaimer";

export type FaqRefineMode = "with-excel" | "html-only" | "schema-deck" | "features-disclaimer";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
};

export function useFaqRefine({
  mode,
  htmlFile,
  htmlFileName,
  excelFile,
}: {
  mode: FaqRefineMode;
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
  const [schemaRows, setSchemaRows] = useState<SchemaDeckRow[]>([]);
  const [schemaWarnings, setSchemaWarnings] = useState<SchemaDeckWarning[]>([]);
  const [featureRows, setFeatureRows] = useState<FeatureDisclaimerExportRow[]>([]);
  const [featureCustomRows, setFeatureCustomRows] = useState<FeatureDisclaimerExportRow[]>([]);
  const [featureWarnings, setFeatureWarnings] = useState<FeatureDisclaimerWarning[]>([]);

  const handleRun = async () => {
    if (!htmlFile) {
      alert("html 파일을 업로드 해주세요.");
      return;
    }
    if (mode === "with-excel" && !excelFile) {
      alert("FAQ html 파일과 카피덱(xlsx) 파일을 모두 업로드 해주세요.");
      return;
    }
    if (mode !== "schema-deck" && !prefix.trim()) {
      alert('새로 부여할 data-copy-set 접두사를 입력해주세요. (예: "SC1")');
      return;
    }

    try {
      setStatus("loading");

      if (mode === "features-disclaimer") {
        const htmlText = await readFileAsText(htmlFile);
        const result = extractFeaturesDisclaimerFromHtml(htmlText, prefix.trim());

        setRefinedHtml(result.html);
        setExportRows([]);
        setWarnings([]);
        setLocaleCodes([]);
        setSchemaRows([]);
        setSchemaWarnings([]);
        setFeatureRows(result.exportRows);
        setFeatureCustomRows(result.customRows);
        setFeatureWarnings(result.warnings);
        setStatus(result.exportRows.length > 0 ? "success" : "fail");

        if (result.exportRows.length === 0) {
          alert("features/disclaimer 후보 요소를 찾지 못했습니다.");
        }
        return;
      }

      if (mode === "schema-deck") {
        const htmlText = await readFileAsText(htmlFile);
        const result = extractSchemaDeckFromHtml(htmlText);

        setRefinedHtml(null);
        setExportRows([]);
        setWarnings([]);
        setLocaleCodes(result.localeCodes);
        setSchemaRows(result.rows);
        setSchemaWarnings(result.warnings);
        setFeatureRows([]);
        setFeatureCustomRows([]);
        setFeatureWarnings([]);
        setStatus(result.rows.length > 0 ? "success" : "fail");

        if (result.rows.length === 0) {
          alert("FAQPage 또는 VideoObject schema를 찾지 못했습니다.");
        }
        return;
      }

      if (mode === "html-only") {
        const htmlText = await readFileAsText(htmlFile);
        const result = extractFaqFromHtml(htmlText, prefix.trim());
        setRefinedHtml(result.html);
        setExportRows(result.exportRows);
        setWarnings(result.warnings);
        setLocaleCodes([]);
        setSchemaRows([]);
        setSchemaWarnings([]);
        setFeatureRows([]);
        setFeatureCustomRows([]);
        setFeatureWarnings([]);
        setStatus("success");
        return;
      }

      const [htmlText, deckExtract] = await Promise.all([
        readFileAsText(htmlFile),
        extractFaqCopyDeck(excelFile as File),
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
      setSchemaRows([]);
      setSchemaWarnings([]);
      setFeatureRows([]);
      setFeatureCustomRows([]);
      setFeatureWarnings([]);
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

  const handleDownloadSchemaExcel = () => {
    if (schemaRows.length === 0) return;
    exportSchemaDeckExcel(schemaRows, htmlFileName || "index_pim");
  };

  const handleDownloadFeatureExcel = () => {
    if (featureRows.length === 0) return;
    exportFeaturesDisclaimerExcel(featureRows, featureCustomRows, htmlFileName || "index_pim");
  };

  const resetRefine = () => {
    setRefinedHtml(null);
    setExportRows([]);
    setWarnings([]);
    setLocaleCodes([]);
    setSchemaRows([]);
    setSchemaWarnings([]);
    setFeatureRows([]);
    setFeatureCustomRows([]);
    setFeatureWarnings([]);
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
    schemaRows,
    schemaWarnings,
    featureRows,
    featureCustomRows,
    featureWarnings,
    handleRun,
    handleDownloadHtml,
    handleDownloadExcel,
    handleDownloadSchemaExcel,
    handleDownloadFeatureExcel,
    resetRefine,
  };
}
