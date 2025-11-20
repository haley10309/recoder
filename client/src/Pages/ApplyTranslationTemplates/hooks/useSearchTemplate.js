import { useState } from "react";
import axios from "axios";

import { countryOptions } from "@/utils/countryOptions";
import { BASE_URL } from "@/utils/routePath";

export const useSearchTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [textareas, setTextareas] = useState([{ asWasCode: "", toBeCode: "", checked: false, isApplied: null }]);
  const [countryCode, setCountryCode] = useState("");
  const [templateId, setTemplateId] = useState(null);

  const isEnglishCountry = countryCode === ""
                            ? null
                            : countryOptions.find((c) => c.name === countryCode)
                              ? !!countryOptions.find((c) => c.name === countryCode)?.isEnglish
                              : null;

  // 템플릿 조회
  const handleSearchTemplate = async () => {
    try {
      const { data } = await axios.post(`${BASE_URL}/get-template-details`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const templateId = data.templateId || [];
      setTemplateId(templateId);

      const localizationEntries = data.localizationEntries || [];
      const lowerCaseCountryCode = countryCode?.toLowerCase?.() || "";
      const newTextareas = localizationEntries.map((entry) => ({
        localizationEntryId: entry.id,
        toBeCode: entry.code_context.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
      }));

      // (250519 기준) aswas_code 기준으로 asset인지 non-asset인지 나눈다.
      // const nonAssetCodeChanges = codeChanges
      //                               .filter((it) => !isAssetCode(it.aswas_code))
      //                               .map( it => ({
      //                                 id: it.id,
      //                                 ppt_no: it.ppt_no || "",
      //                                 aswas_code: it.aswas_code?.trim() || "",
      //                                 tobe_code: it.tobe_code?.trim() || "",
      //                               }) );
      // const newTextareas = nonAssetCodeChanges.map((pair) => ({
      //   asWasCode: pair.aswas_code.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
      //   toBeCode: pair.tobe_code.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`),
      //   pptNo: pair.ppt_no,
      //   checked: true, // 체크박스 기능 사용x
      // }));

      setTextareas(newTextareas);
      alert("성공적으로 템플릿을 불러왔습니다.");
    } catch (error) {
      console.error("❌❌ Error fetching code pairs:", error);
      alert("서버 요청에 실패했습니다. 콘솔을 확인해주세요.");
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
    countryCode,
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    isEnglishCountry,
    textareas,
    setTextareas,
    handleSearchTemplate,
    handleCountryChange,
    handleToBeCodeChange,
    handleLocalizedToBeCodeChange,
    templateId,
    handleAddTextarea,
  };
};
