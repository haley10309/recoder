import { useState } from "react";
import axios from "axios";

import { isAssetCode, kind_countOccurrences } from "@/utils/codeUtils";
import { countryOptions } from "@/utils/countryOptions";
import { BASE_URL } from "@/utils/routePath";

export const useSearchTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [textareas, setTextareas] = useState([{ asWasCode: "", toBeCode: "", checked: false, isApplied: null }]);
  const [countryCode, setCountryCode] = useState("");
  const [templateId, setTemplateId] = useState(null);

  const [filter, setFilter] = useState("");
  const [filterTobe, setFilterTobe] = useState("");

  const isEnglishCountry = countryCode === ""
                            ? null
                            : countryOptions.find((c) => c.name === countryCode)
                              ? !!countryOptions.find((c) => c.name === countryCode)?.isEnglish
                              : null

  // 템플릿 조회
  const handleSearchTemplate = async () => {
    try {
      const { data } = await axios.post(`${BASE_URL}/get-template-details`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const templateId = data.templateId || [];
      const codeChanges = data.codeChanges || [];
      // const localizationEntries = data.localizationEntries || [];

      setTemplateId(templateId);

      // (250519 기준) aswas_code 기준으로 asset인지 non-asset인지 나눈다.
      const nonAssetCodeChanges = codeChanges
                                    .filter((it) => !isAssetCode(it.aswas_code))
                                    .map( it => ({
                                      id: it.id,
                                      ppt_no: it.ppt_no || "",
                                      aswas_code: it.aswas_code?.trim() || "",
                                      tobe_code: it.tobe_code?.trim() || "",
                                    }) );
      // const assetCodeChanges = codeChanges
      //                               .filter((it) => isAssetCode(it.aswas_code))
      //                               .map( it => ({
      //                                 id: it.id,
      //                                 ppt_no: it.ppt_no || "",
      //                                 aswas_code: it.aswas_code?.trim() || "",
      //                                 tobe_code: it.tobe_code?.trim() || "",
      //                               }) );

      const newTextareas = nonAssetCodeChanges.map((pair) => ({
        asWasCode: pair.aswas_code,
        toBeCode: pair.tobe_code,
        pptNo: pair.ppt_no,
        checked: true,
      }));
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

  const handleCheckedChange = (index) => {
    const newTextareas = [...textareas];
    newTextareas[index] = {
      ...newTextareas[index],
      checked: !newTextareas[index].checked,
    };
    setTextareas(newTextareas);
  };

  const filterTextareas = () => {
    let filtered = textareas.slice(0);

    if (filter === "checked") {
      filtered = filtered.filter((textarea) => textarea.checked);
    } else if (filter === "unchecked") {
      filtered = filtered.filter((textarea) => !textarea.checked);
    }

    if (filterTobe === "yes") {
      // TODO: isApplied는 또 뭐임
      filtered = filtered.filter((textarea) => textarea.isApplied === "yes");
    } else if (filterTobe === "no") {
      filtered = filtered.filter((textarea) => textarea.isApplied === "no");
    }

    return filtered;
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
    handleAsWasCodeChange,
    handleToBeCodeChange,
    handleCheckedChange,
    filterTextareas,
    filter,
    filterTobe,
    templateId,
  };
};
