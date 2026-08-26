import { useState, useEffect } from "react";

import { useFetchTemplate } from "@/hooks/useFetchTemplate";

import { countryOptions } from "@/utils/countryOptions";
import defaultAxios from "@/apis/defaultAxios";
import { replaceCountryCode } from "@/utils/codeUtils";

interface UseTemplateProps {
  excelFile: File | null;
  countryCode: string;
  setCountryCode: React.Dispatch<React.SetStateAction<string>>;
}

/** 서버(get-details-with-excel) 응답 행 */
interface ApiRow {
  id?: number;
  row_order?: number;
  key?: string;
  target_selector?: string;
  apply_type?: string;
  exclude_sup?: boolean;
  enable_text_transform?: boolean;
  original_copy?: string;
  translated_copy?: string;
}

/** 화면에서 사용하는 행 */
export interface ApplyRow {
  id?: number;
  rowOrder?: number;
  /** SCHEMA 행 식별용 (SCHEMA-001 등) */
  key: string;
  target?: string;
  applyType?: string;
  excludeSup?: boolean;
  enableTextTransform?: boolean;
  originalCopy: string;
  deckCopy: string;
  appliedCopy: string;
  selectedEnglishCopies: string[];
}

export const useTemplate = ({
  excelFile,
  countryCode,
  setCountryCode,
}: UseTemplateProps) => {
  const [workDate, setWorkDate] = useState(() => sessionStorage.getItem("workDate") ?? "");
  const [sku, setSku] = useState(() => sessionStorage.getItem("sku") ?? "");

  useEffect(() => {
    sessionStorage.setItem("ticketNum", workDate);
  }, [workDate]);
  useEffect(() => {
    sessionStorage.setItem("ticketUrl", sku);
  }, [sku]);

  const {
    loading: templateOptionLoading,
    ticketNumOptions: skuOptions,    
    ticketUrlOptions: dateOptions,
  } = useFetchTemplate({
    shouldFetchOnMount: true,
    ticketNum: workDate,
    ticketUrl: sku,
  });

  const [textareas, setTextareas] = useState<ApplyRow[]>([]);
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);

  const isEnglishCountry = countryCode === "" 
  ? null 
  : countryOptions.find((c) => c.name === countryCode)
  ? !!countryOptions.find((c) => c.name === countryCode)?.isEnglish
  : null;

  // 템플릿 조회
  const handleGetTemplate = async () => {
    try {
      setTemplateLoading(true);

      // 🔥 필수값 체크
      if (!workDate || !sku) {
        alert("작업일자와 SKU를 입력해주세요.");
        return;
      }

      if (!countryCode) {
        alert("국가코드를 선택해주세요.");
        return;
      }

      if (!excelFile) {
        alert("번역덱 파일을 업로드해주세요.");
        return;
      }

      // 🔥 multipart/form-data
      const formData = new FormData();

      formData.append("ticket_num", workDate);
      formData.append("ticket_url", sku);
      formData.append("country_code", countryCode.toUpperCase());

      // 파일
      formData.append("file", excelFile);

      const { data } = await defaultAxios.post(
        "/unpack-templates/get-details-with-excel",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const rows: ApiRow[] = data.row_list || [];

      const normalized: ApplyRow[] = rows.map((it) => ({
        id: it.id,
        rowOrder: it.row_order,

        // SCHEMA 행 식별용 (SCHEMA-001 등)
        key: it.key || "",

        target: it.target_selector,
        applyType: it.apply_type,

        excludeSup: it.exclude_sup,
        enableTextTransform: it.enable_text_transform,

        originalCopy: it.original_copy || "",
        deckCopy: it.translated_copy || "",
        appliedCopy: "",

        selectedEnglishCopies: [],
      }));

      // // 임시 디버깅
      // console.log("[template] 총", normalized.length, "행");
      // console.log("[template] SCHEMA:", normalized.filter(r => /^SCHEMA/i.test(r.key ?? "")).length, "행");
      // console.log("[template] 첫 SCHEMA 행:", normalized.find(r => /^SCHEMA/i.test(r.key ?? "")));

      setTextareas(normalized);

      alert("템플릿을 성공적으로 불러왔습니다.");
    } catch (error) {
      console.error("❌ 템플릿 조회 실패:", error);
      alert("템플릿 조회 중 오류가 발생했습니다.");
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleCountryChange = (inputValue: string) => {
    setCountryCode(inputValue);
  };

  return {
    templateLoading,
    skuOptions,
    dateOptions,
    countryCode,
    workDate,
    setWorkDate,
    sku,
    setSku,
    isEnglishCountry,
    textareas,
    setTextareas,
    handleGetTemplate,
    handleCountryChange,
    templateId,
  };
};