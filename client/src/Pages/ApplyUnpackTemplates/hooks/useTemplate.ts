import { useState,useEffect } from "react";

import { useFetchTemplate } from "@/hooks/useFetchTemplate";

import { countryOptions } from "@/utils/countryOptions";
import defaultAxios from "@/apis/defaultAxios";
import { replaceCountryCode } from "@/utils/codeUtils";

interface UseTemplateProps {
  excelFile: File | null;
  countryCode: string;
  setCountryCode: React.Dispatch<React.SetStateAction<string>>;
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

  const [textareas, setTextareas] = useState([{ asWasCode: "", toBeCode: "", checked: false, isApplied: null, selectedEnglishCopies: [] }]);
  const [templateId, setTemplateId] = useState(null);
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

      const rows = data.row_list || [];

      const normalized = rows.map((it) => ({
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

      // 임시 디버깅
      console.log("[template] 총", normalized.length, "행");
      console.log("[template] SCHEMA:", normalized.filter(r => /^SCHEMA/i.test(r.key ?? "")).length, "행");
      console.log("[template] 첫 SCHEMA 행:", normalized.find(r => /^SCHEMA/i.test(r.key ?? "")));

      setTextareas(normalized);

      alert("템플릿을 성공적으로 불러왔습니다.");
    } catch (error) {
      console.error("❌ 템플릿 조회 실패:", error);
      alert("템플릿 조회 중 오류가 발생했습니다.");
    } finally {
      setTemplateLoading(false);
    }
  };

  const handleCountryChange = (inputValue) => {
    setCountryCode(inputValue);
  };

  const handleToBeCodeChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, toBeCode: value } : textarea
    );
    setTextareas(newTextareas);
  };

  const handleLocalizedToBeCodeChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, localizedToBeCode: value } : textarea
    );
    setTextareas(newTextareas);
  };

  const handleAddTextarea = () => {
    const newTextareas = [
      ...textareas,
      { toBeCode: "", localizedToBeCode: "" }
    ]
    setTextareas(newTextareas);
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
    handleToBeCodeChange,
    handleLocalizedToBeCodeChange,
    templateId,
    handleAddTextarea,
  };
};
