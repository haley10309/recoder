import { useState } from "react";

import { useFetchTemplate } from "@/hooks/useFetchTemplate";

import { countryOptions } from "@/utils/countryOptions";
import { isAssetCode } from "@/utils/codeUtils";
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

      const codeChanges = (data.codeChanges ?? [])
                                    .filter((it) => !isAssetCode(it.aswas_code))
                                    .map( it => ({
                                      id: it.id,
                                      ppt_no: it.ppt_no || "",
                                      aswas_code: it.aswas_code?.trim() || "",
                                      tobe_code: it.tobe_code?.trim() || "",
                                      // localized_tobe_code: it.localized_tobe_code?.trim() || "",
                                      localized_tobe_code: "",
                                    }) );

                                    
      const lowerCaseCountryCode = countryCode?.toLowerCase?.() || "";
      const newTextareas = codeChanges.map((pair) => ({
        id: pair.id,
        pptNo: pair.ppt_no,
        asWasCode: pair.aswas_code.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
        toBeCode: pair.tobe_code.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
        localizedToBeCode: "",
        checked: true,
      }));
      setTextareas(newTextareas);
      alert("성공적으로 템플릿을 불러왔습니다.");
    } catch (error) {
      alert(error.response.data.error 
              ? `${error.response.data.error} (${error.response.status})` 
              : `서버 요청에 실패했습니다. 콘솔을 확인해주세요. (${error.response.status})`
          );
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