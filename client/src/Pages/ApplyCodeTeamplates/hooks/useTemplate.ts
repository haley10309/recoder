import { useState } from "react";

import { useFetchTemplate } from "@/hooks/useFetchTemplate";

import { countryOptions } from "@/utils/countryOptions";
import { replaceCountryCode, isAssetCode } from "@/utils/codeUtils";
import defaultAxios from "@/apis/defaultAxios";

export const useTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  
  const {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
  } = useFetchTemplate({ shouldFetchOnMount: true, ticketNum, ticketUrl });

  const [textareas, setTextareas] = useState([{ asWasCode: "", toBeCode: "", localizedToBeCode: "", checked: false, isApplied: null }]);
  const [countryCode, setCountryCode] = useState("");
  const [templateId, setTemplateId] = useState(null);

  const isEnglishCountry = countryCode === ""
                            ? null
                            : countryOptions.find((c) => c.name === countryCode)
                              ? !!countryOptions.find((c) => c.name === countryCode)?.isEnglish
                              : null;

  const handleGetTemplate = async () => {
    try {
      if (!ticketNum) {
        alert("Jira 티켓 번호를 입력해주세요.")
        return;
      }
      if (!ticketUrl) {
        alert("AEM Url을 입력해주세요.")
        return;
      }
      if (!countryCode) {
        alert("국가코드를 선택해주세요.")
        return;
      }

      const { data } = await defaultAxios.post(`/get-template-details`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      
      if (data.templateId) setTemplateId(data.templateId);

      const newTextareas = (data.codeChanges ?? [])
        .filter((it) => !isAssetCode(it.aswas_code))
        .map((it) => {
          const matchedVariation = it.variations?.find((v) =>
            v.countries?.includes(countryCode)
          );

          const finalAsWas =
            matchedVariation?.aswas_code_variation || it.aswas_code;

          const finalToBe =
            matchedVariation?.tobe_code_variation || it.tobe_code;

          return {
            id: it.id,
            pptNo: it.ppt_no || "",
            asWasCode: replaceCountryCode(finalAsWas?.trim() || "", countryCode),
            toBeCode: replaceCountryCode(finalToBe?.trim() || "", countryCode),
            localizedToBeCode: "",
            checked: true,
          };
        });

      setTextareas(newTextareas);
      alert("성공적으로 템플릿을 불러왔습니다.");
    } catch (error) {
    }
  };

  const handleCountryChange = (inputValue) => {
    setCountryCode(inputValue);
  };

  const handleAsWasCodeChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, asWasCode: value } : textarea
    );
    setTextareas(newTextareas);
  };

  const handleToBeCodeChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, toBeCode: value } : textarea
    );
    setTextareas(newTextareas);
  };

  const handlePptNoChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, pptNo: value } : textarea
    );
    setTextareas(newTextareas);
  };

  return {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
    countryCode,
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    isEnglishCountry,
    textareas,
    setTextareas,
    handleCountryChange,
    handleGetTemplate,
    handleAsWasCodeChange,
    handleToBeCodeChange,
    handlePptNoChange,
    templateId,
  };
};