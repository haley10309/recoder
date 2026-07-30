import { useState } from "react";

import { parseExcelFile } from "@/apis/apis";
import { analyzePreCoder } from "../utils/analyzePreCoder";
import type { CopyDeckRow, PreCoderAnalysisResult } from "../utils/analyzePreCoder";

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
}: {
  htmlFile: File | null;
  excelFile: File | null;
}) {
  const [result, setResult] = useState<PreCoderAnalysisResult | null>(null);
  const [copyDeckRows, setCopyDeckRows] = useState<CopyDeckRow[] | null>(null);
  const [analyzeStatus, setAnalyzeStatus] = useState<"" | "loading" | "success" | "fail">("");

  const handleAnalyze = async () => {
    if (!htmlFile || !excelFile) {
      alert("html 파일과 카피덱(xlsx) 파일을 모두 업로드 해주세요.");
      return;
    }

    try {
      setAnalyzeStatus("loading");

      const [htmlText, row_list] = await Promise.all([
        readFileAsText(htmlFile),
        parseExcelFile(excelFile),
      ]);

      if (!row_list || row_list.length === 0) {
        setAnalyzeStatus("fail");
        alert("카피덱(xlsx)에서 데이터를 읽어오지 못했습니다. 파일 형식을 확인해주세요.");
        return;
      }

      const analyzed = analyzePreCoder(htmlText, row_list);
      setResult(analyzed);
      setCopyDeckRows(row_list);
      setAnalyzeStatus("success");
    } catch (error) {
      console.error("[usePreCoderAnalysis] 에러", error);
      setAnalyzeStatus("fail");
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setCopyDeckRows(null);
    setAnalyzeStatus("");
  };

  return {
    result,
    copyDeckRows,
    analyzeStatus,
    handleAnalyze,
    resetAnalysis,
  };
}
