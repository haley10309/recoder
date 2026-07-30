import { useEffect, useState } from "react";

import {
  fetchPreCoderResultDetail,
  fetchPreCoderResults,
} from "@/apis/preCoderApis";
import type { PreCoderResultSummary } from "@/apis/preCoderApis";
import type { CopyDeckRow, PreCoderAnalysisResult } from "../utils/analyzePreCoder";

export type LoadedPreCoderResult = {
  id: number;
  title: string;
  htmlFilename: string;
  excelFilename: string;
  createdByName: string | null;
  createdAt: string;
  htmlContent: string;
  copyDeckRows: CopyDeckRow[];
  result: PreCoderAnalysisResult;
};

export function usePreCoderHistory() {
  const [historyList, setHistoryList] = useState<PreCoderResultSummary[]>([]);
  const [historyLoadStatus, setHistoryLoadStatus] = useState<"" | "loading" | "success" | "fail">("");
  const [loadedResult, setLoadedResult] = useState<LoadedPreCoderResult | null>(null);
  const [detailLoadStatus, setDetailLoadStatus] = useState<"" | "loading" | "success" | "fail">("");

  const refreshHistory = async () => {
    try {
      setHistoryLoadStatus("loading");
      const list = await fetchPreCoderResults();
      setHistoryList(list);
      setHistoryLoadStatus("success");
    } catch (error) {
      console.error("[usePreCoderHistory] 목록 조회 에러", error);
      setHistoryLoadStatus("fail");
    }
  };

  const loadResultDetail = async (id: number) => {
    try {
      setDetailLoadStatus("loading");
      const detail = await fetchPreCoderResultDetail(id);
      setLoadedResult({
        id: detail.id,
        title: detail.title,
        htmlFilename: detail.html_filename,
        excelFilename: detail.excel_filename,
        createdByName: detail.created_by_name,
        createdAt: detail.created_at,
        htmlContent: detail.html_content,
        copyDeckRows: JSON.parse(detail.copy_deck_json),
        result: JSON.parse(detail.result_json),
      });
      setDetailLoadStatus("success");
    } catch (error) {
      console.error("[usePreCoderHistory] 상세 조회 에러", error);
      setDetailLoadStatus("fail");
    }
  };

  const clearLoadedResult = () => setLoadedResult(null);

  useEffect(() => {
    refreshHistory();
  }, []);

  return {
    historyList,
    historyLoadStatus,
    refreshHistory,
    loadedResult,
    detailLoadStatus,
    loadResultDetail,
    clearLoadedResult,
  };
}
