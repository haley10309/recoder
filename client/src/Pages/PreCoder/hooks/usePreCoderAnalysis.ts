import { useState } from "react";

import { parseExcelFile } from "@/apis/apis";
import { analyzePreCoder } from "../utils/analyzePreCoder";
import type { CopyDeckRow, PreCoderAnalysisResult } from "../utils/analyzePreCoder";
import { analyzeSchemaDeck } from "../utils/analyzeSchemaDeck";
import type { SchemaCheckResult } from "../utils/analyzeSchemaDeck";

export type PreCoderRunMode = "features-disclaimer" | "faq" | "schema" | "all";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
};

export function usePreCoderAnalysis({
  htmlFile,
  excelFile,
  mode,
}: {
  htmlFile: File | null;
  excelFile: File | null;
  mode: PreCoderRunMode;
}) {
  const [result, setResult] = useState<PreCoderAnalysisResult | null>(null);
  const [schemaResult, setSchemaResult] = useState<SchemaCheckResult | null>(null);
  const [copyDeckRows, setCopyDeckRows] = useState<CopyDeckRow[] | null>(null);
  const [analyzeStatus, setAnalyzeStatus] = useState<"" | "loading" | "success" | "fail">("");

  const handleAnalyze = async () => {
    if (!htmlFile) {
      alert("html 파일을 업로드 해주세요.");
      return;
    }
    if (mode !== "schema" && !excelFile) {
      alert("html 파일과 카피덱(xlsx) 파일을 모두 업로드 해주세요.");
      return;
    }

    try {
      setAnalyzeStatus("loading");
      const htmlText = await readFileAsText(htmlFile);

      // Schema는 data-copy-set 태그 체계를 쓰지 않아 카피덱 대조 방식이 아니라
      // html의 JSON-LD를 직접 검사한다 (카피덱 업로드 불필요).
      if (mode === "schema") {
        const schemaAnalyzed = analyzeSchemaDeck(htmlText);
        setSchemaResult(schemaAnalyzed);
        setResult(null);
        setCopyDeckRows(null);
        setAnalyzeStatus(schemaAnalyzed.totalCount > 0 ? "success" : "fail");
        if (schemaAnalyzed.totalCount === 0) {
          alert("html에서 FAQPage / VideoObject schema를 찾지 못했습니다.");
        }
        return;
      }

      const row_list = excelFile ? await parseExcelFile(excelFile) : [];
      if (!row_list || row_list.length === 0) {
        setAnalyzeStatus("fail");
        alert("카피덱(xlsx)에서 데이터를 읽어오지 못했습니다. 파일 형식을 확인해주세요.");
        return;
      }

      const scope = mode === "all" ? "all" : mode; // "features-disclaimer" | "faq"
      const analyzed = analyzePreCoder(htmlText, row_list, scope);
      setResult(analyzed);
      setCopyDeckRows(row_list);

      // 전체 검사에서는 schema도 함께 보여준다 (카피덱 대조가 아니라 html 자체 검사).
      setSchemaResult(mode === "all" ? analyzeSchemaDeck(htmlText) : null);

      setAnalyzeStatus("success");
    } catch (error) {
      console.error("[usePreCoderAnalysis] 에러", error);
      setAnalyzeStatus("fail");
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setSchemaResult(null);
    setCopyDeckRows(null);
    setAnalyzeStatus("");
  };

  return {
    result,
    schemaResult,
    copyDeckRows,
    analyzeStatus,
    handleAnalyze,
    resetAnalysis,
  };
}