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

// 카피덱은 종류별(features / FAQ / schema)로 따로 받는다. 종류마다 파서가 달라서
// (features·FAQ: target_selector 등 unpack 포맷 / schema: Key·Category·Item·Copy 포맷)
// 한 슬롯을 모드끼리 공유하면, 모드를 바꿨을 때 다른 종류의 카피덱이 엉뚱한 파서로 들어간다.
export function usePreCoderAnalysis({
  htmlFile,
  featuresExcelFile,
  faqExcelFile,
  schemaExcelFile,
  mode,
}: {
  htmlFile: File | null;
  featuresExcelFile: File | null;
  faqExcelFile: File | null;
  schemaExcelFile: File | null;
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
    if (mode === "all" && (!featuresExcelFile || !faqExcelFile)) {
      alert("html 파일과 features 카피덱, FAQ 카피덱(xlsx)을 모두 업로드 해주세요.");
      return;
    }
    if (mode === "features-disclaimer" && !featuresExcelFile) {
      alert("html 파일과 features 카피덱(xlsx) 파일을 모두 업로드 해주세요.");
      return;
    }
    if (mode === "faq" && !faqExcelFile) {
      alert("html 파일과 FAQ 카피덱(xlsx) 파일을 모두 업로드 해주세요.");
      return;
    }

    try {
      setAnalyzeStatus("loading");
      const htmlText = await readFileAsText(htmlFile);

      // Schema는 data-copy-set 태그 체계를 쓰지 않아, html의 JSON-LD에서 추출한 "정답 카피덱"과
      // 업로드된 schema 카피덱을 Key 기준으로 대조한다. (카피덱은 선택 - 없으면 html 자체 점검만)
      if (mode === "schema") {
        let schemaDeckRows: SchemaCopyDeckRow[] | undefined;

        if (schemaExcelFile) {
          const rows = await loadSchemaDeckRows(schemaExcelFile);
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
        // 카피덱마다 엑셀 파싱(python/xlwings)을 하나씩 순서대로 돌리고, 실패하면 어느 카피덱인지 알려준다.
        let featuresRows: CopyDeckRow[];
        let faqRows: CopyDeckRow[];
        let schemaDeckRows: SchemaCopyDeckRow[] | null | undefined;
        let parsingDeck = "features 카피덱";
        try {
          featuresRows = await parseExcelFile(featuresExcelFile);
          parsingDeck = "FAQ 카피덱";
          faqRows = await parseExcelFile(faqExcelFile);
          parsingDeck = "schema 카피덱";
          schemaDeckRows = schemaExcelFile ? await loadSchemaDeckRows(schemaExcelFile) : undefined;
        } catch (error: any) {
          const serverMessage = error?.response?.data?.error || error?.response?.data?.message || "";
          console.error(`[usePreCoderAnalysis] ${parsingDeck} 파싱 에러`, error);
          setAnalyzeStatus("fail");
          alert(
            `${parsingDeck}(xlsx)를 읽지 못했습니다.${serverMessage ? `\n- ${serverMessage}` : ""}\n` +
              (parsingDeck === "schema 카피덱"
                ? "schema 카피덱은 Key / Category / Item / Copy(original_copy) 컬럼이 있어야 합니다."
                : "features / FAQ 카피덱은 target_selector, apply_type, exclude_sup, enable_text_transform, original_copy, CA_FR 컬럼이 1행(또는 2행) 헤더에 있어야 합니다.")
          );
          return;
        }

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

      const deckFile = mode === "faq" ? faqExcelFile : featuresExcelFile;
      const row_list = deckFile ? await parseExcelFile(deckFile) : [];
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
