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
  const [sku, setSku] = useState(() => sessionStorage.getItem("sku") ?? "");
  const [workDate, setWorkDate] = useState(() => sessionStorage.getItem("workDate") ?? "");

  useEffect(() => {
    sessionStorage.setItem("ticketNum", sku);
  }, [sku]);

  useEffect(() => {
    sessionStorage.setItem("ticketUrl", workDate);
  }, [workDate]);
  const {
    loading,
    ticketNumOptions: skuOptions,    
    ticketUrlOptions: dateOptions,
  } = useFetchTemplate({
    shouldFetchOnMount: true,
    ticketNum: sku,
    ticketUrl: workDate,
  });

  const [textareas, setTextareas] = useState([{ asWasCode: "", toBeCode: "", checked: false, isApplied: null, selectedEnglishCopies: [] }]);
  const [templateId, setTemplateId] = useState(null);

  const isEnglishCountry = countryCode === ""
                            ? null
                            : countryOptions.find((c) => c.name === countryCode)
                              ? !!countryOptions.find((c) => c.name === countryCode)?.isEnglish
                              : null;

  // 템플릿 조회
  const handleGetTemplate = async () => {
    try {
      // 🔥 필수값 체크
      if (!sku || !workDate) {
        alert("SKU와 작업일자를 입력해주세요.");
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

      formData.append("ticket_num", sku);
      formData.append("ticket_url", workDate);
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

        target: it.target_selector,
        applyType: it.apply_type,

        excludeSup: it.exclude_sup,
        enableTextTransform: it.enable_text_transform,

        originCopy: it.original_copy,
        deckCopy: it.translated_copy || "",

        selectedEnglishCopies: [],
      }));

      setTextareas(normalized);

      alert("템플릿을 성공적으로 불러왔습니다.");
    } catch (error) {
      console.error("❌ 템플릿 조회 실패:", error);
      alert("템플릿 조회 중 오류가 발생했습니다.");
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
    loading,
    skuOptions,
    dateOptions,
    countryCode,
    sku,
    setSku,
    workDate,
    setWorkDate,
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
