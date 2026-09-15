import { useState } from "react";

import { extractFaqFromHtml } from "../utils/refineFaqHtml";
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

// ① features+disclaimer 추출 / ② FAQ 추출 / ③ schema 추출 / ④ 전체 추출(①+②+③을 한 번에)
export type FaqRefineMode = "features-disclaimer" | "faq" | "schema-deck" | "all";

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
}: {
  mode: FaqRefineMode;
  htmlFile: File | null;
  htmlFileName: string;
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

  const resetAllResultState = () => {
    setRefinedHtml(null);
    setExportRows([]);
    setWarnings([]);
    setLocaleCodes([]);
    setSchemaRows([]);
    setSchemaWarnings([]);
    setFeatureRows([]);
    setFeatureCustomRows([]);
    setFeatureWarnings([]);
  };

  const handleRun = async () => {
    if (!htmlFile) {
      alert("html 파일을 업로드 해주세요.");
      return;
    }
    if (mode !== "schema-deck" && !prefix.trim()) {
      alert('새로 부여할 data-copy-set 접두사를 입력해주세요. (예: "SC1")');
      return;
    }

    try {
      setStatus("loading");
      const htmlText = await readFileAsText(htmlFile);

      if (mode === "features-disclaimer") {
        const result = extractFeaturesDisclaimerFromHtml(htmlText, prefix.trim());

        resetAllResultState();
        setRefinedHtml(result.html);
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
        const result = extractSchemaDeckFromHtml(htmlText);

        resetAllResultState();
        setLocaleCodes(result.localeCodes);
        setSchemaRows(result.rows);
        setSchemaWarnings(result.warnings);
        setStatus(result.rows.length > 0 ? "success" : "fail");

        if (result.rows.length === 0) {
          alert("FAQPage 또는 VideoObject schema를 찾지 못했습니다.");
        }
        return;
      }

      if (mode === "faq") {
        const result = extractFaqFromHtml(htmlText, prefix.trim());

        resetAllResultState();
        setRefinedHtml(result.html);
        setExportRows(result.exportRows);
        setWarnings(result.warnings);
        setStatus("success");
        return;
      }

      // mode === "all": FAQ → features+disclaimer 순으로 같은 html에 이어서 태깅하고,
      // schema는 태깅과 무관하게(JSON-LD 읽기 전용) 별도로 함께 추출한다.
      const faqResult = extractFaqFromHtml(htmlText, prefix.trim());
      const featureResult = extractFeaturesDisclaimerFromHtml(faqResult.html, prefix.trim());
      const schemaResult = extractSchemaDeckFromHtml(htmlText);

      setRefinedHtml(featureResult.html);
      setExportRows(faqResult.exportRows);
      setWarnings(faqResult.warnings);
      setLocaleCodes(schemaResult.localeCodes);
      setFeatureRows(featureResult.exportRows);
      setFeatureCustomRows(featureResult.customRows);
      setFeatureWarnings(featureResult.warnings);
      setSchemaRows(schemaResult.rows);
      setSchemaWarnings(schemaResult.warnings);

      const hasAny =
        faqResult.exportRows.length > 0 ||
        featureResult.exportRows.length > 0 ||
        schemaResult.rows.length > 0;
      setStatus(hasAny ? "success" : "fail");
      if (!hasAny) {
        alert("FAQ / features / disclaimer / schema 어느 것도 찾지 못했습니다.");
      }
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
    const baseName = (htmlFileName || "index_pim").replace(/\.html?$/i, "");
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
    resetAllResultState();
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