import { useState } from "react";

import { parseExcelFile } from "@/apis/apis";
import { extractFaqCopyDeck } from "@/apis/preCoderFaqApis";
import { analyzePreCoder } from "../utils/analyzePreCoder";
import type { CopyDeckRow, PreCoderAnalysisResult } from "../utils/analyzePreCoder";
import { analyzeSchemaDeck } from "../utils/analyzeSchemaDeck";
import type { SchemaCheckResult, SchemaCopyDeckRow } from "../utils/analyzeSchemaDeck";

export type PreCoderRunMode = "features-disclaimer" | "faq" | "schema" | "all";

// ④ 전체 검사에서 카피덱별로 돌린 ①features+disclaimer / ②FAQ 대조 결과.
export type PreCoderDeckCheck = {
  result: PreCoderAnalysisResult;
  copyDeckRows: CopyDeckRow[];
};

export type PreCoderAllCheckResult = {
  features: PreCoderDeckCheck;
  faq: PreCoderDeckCheck;
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "utf-8");
  });
};

// schema 카피덱도 Key/Category/Item/Copy 구조라 FAQ 카피덱 파서를 그대로 재사용한다.
// 읽어온 행이 없으면 null을 돌려준다.
const loadSchemaDeckRows = async (file: File): Promise<SchemaCopyDeckRow[] | null> => {
  const extracted = await extractFaqCopyDeck(file);
  if (!extracted.rows || extracted.rows.length === 0) return null;
  return extracted.rows.map((r) => ({
    key: r.key,
    category: r.category,
    item: r.item,
    copy: r.copy,
  }));
};

export function usePreCoderAnalysis({
  htmlFile,
  excelFile,
  faqExcelFile = null,
  schemaExcelFile = null,
  mode,
}: {
  htmlFile: File | null;
  excelFile: File | null;
  faqExcelFile?: File | null;
  schemaExcelFile?: File | null;
  mode: PreCoderRunMode;
}) {
  const [result, setResult] = useState<PreCoderAnalysisResult | null>(null);
  const [allResult, setAllResult] = useState<PreCoderAllCheckResult | null>(null);
  const [schemaResult, setSchemaResult] = useState<SchemaCheckResult | null>(null);
  const [copyDeckRows, setCopyDeckRows] = useState<CopyDeckRow[] | null>(null);
  const [analyzeStatus, setAnalyzeStatus] = useState<"" | "loading" | "success" | "fail">("");

  const handleAnalyze = async () => {
    if (!htmlFile) {
      alert("html 파일을 업로드 해주세요.");
      return;
    }
    if (mode === "all" && (!excelFile || !faqExcelFile)) {
      alert("html 파일과 features 카피덱, FAQ 카피덱(xlsx)을 모두 업로드 해주세요.");
      return;
    }
    if (mode !== "schema" && !excelFile) {
      alert("html 파일과 카피덱(xlsx) 파일을 모두 업로드 해주세요.");
      return;
    }

    try {
      setAnalyzeStatus("loading");
      const htmlText = await readFileAsText(htmlFile);

      // Schema는 data-copy-set 태그 체계를 쓰지 않아, html의 JSON-LD에서 추출한 "정답 카피덱"과
      // 업로드된 schema 카피덱을 Key 기준으로 대조한다. (카피덱은 선택 - 없으면 html 자체 점검만)
      if (mode === "schema") {
        let schemaDeckRows: SchemaCopyDeckRow[] | undefined;

        if (excelFile) {
          const rows = await loadSchemaDeckRows(excelFile);
          if (!rows) {
            setAnalyzeStatus("fail");
            alert("schema 카피덱(xlsx)에서 데이터를 읽어오지 못했습니다. 파일 형식을 확인해주세요.");
            return;
          }
          schemaDeckRows = rows;
        }

        const schemaAnalyzed = analyzeSchemaDeck(htmlText, schemaDeckRows);
        setSchemaResult(schemaAnalyzed);
        setResult(null);
        setAllResult(null);
        setCopyDeckRows(null);
        setAnalyzeStatus(schemaAnalyzed.totalCount > 0 ? "success" : "fail");
        if (schemaAnalyzed.totalCount === 0) {
          alert("html에서 FAQPage / VideoObject schema를 찾지 못했습니다.");
        }
        return;
      }

      // 전체 검사: 카피덱 3종을 각각 ①②③ 검사에 넣어, 개별 모드로 돌린 것과 같은 결과를 한 번에 만든다.
      if (mode === "all") {
        const [featuresRows, faqRows, schemaDeckRows] = await Promise.all([
          parseExcelFile(excelFile),
          parseExcelFile(faqExcelFile),
          schemaExcelFile ? loadSchemaDeckRows(schemaExcelFile) : Promise.resolve(undefined),
        ]);

        const emptyDecks = [
          (!featuresRows || featuresRows.length === 0) && "features 카피덱",
          (!faqRows || faqRows.length === 0) && "FAQ 카피덱",
          schemaDeckRows === null && "schema 카피덱",
        ].filter(Boolean);
        if (emptyDecks.length > 0) {
          setAnalyzeStatus("fail");
          alert(`${emptyDecks.join(", ")}(xlsx)에서 데이터를 읽어오지 못했습니다. 파일 형식을 확인해주세요.`);
          return;
        }

        setAllResult({
          features: {
            result: analyzePreCoder(htmlText, featuresRows, "features-disclaimer"),
            copyDeckRows: featuresRows,
          },
          faq: {
            result: analyzePreCoder(htmlText, faqRows, "faq"),
            copyDeckRows: faqRows,
          },
        });
        setSchemaResult(analyzeSchemaDeck(htmlText, schemaDeckRows ?? undefined));
        setResult(null);
        setCopyDeckRows(null);
        setAnalyzeStatus("success");
        return;
      }

      const row_list = excelFile ? await parseExcelFile(excelFile) : [];
      if (!row_list || row_list.length === 0) {
        setAnalyzeStatus("fail");
        alert("카피덱(xlsx)에서 데이터를 읽어오지 못했습니다. 파일 형식을 확인해주세요.");
        return;
      }

      const analyzed = analyzePreCoder(htmlText, row_list, mode); // "features-disclaimer" | "faq"
      setResult(analyzed);
      setCopyDeckRows(row_list);
      setAllResult(null);
      setSchemaResult(null);

      setAnalyzeStatus("success");
    } catch (error) {
      console.error("[usePreCoderAnalysis] 에러", error);
      setAnalyzeStatus("fail");
    }
  };

  const resetAnalysis = () => {
    setResult(null);
    setAllResult(null);
    setSchemaResult(null);
    setCopyDeckRows(null);
    setAnalyzeStatus("");
  };

  return {
    result,
    allResult,
    schemaResult,
    copyDeckRows,
    analyzeStatus,
    handleAnalyze,
    resetAnalysis,
  };
}
