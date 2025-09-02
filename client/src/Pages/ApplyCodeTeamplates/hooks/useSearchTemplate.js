import { useState } from "react";
import axios from "axios";

import { countryOptions } from "@/utils/countryOptions";
import { isAssetCode } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";

export const useSearchTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [textareas, setTextareas] = useState([{ asWasCode: "", toBeCode: "", localizedToBeCode: "", checked: false, isApplied: null }]);
  const [countryCode, setCountryCode] = useState("");
  const [templateId, setTemplateId] = useState(null);

  const [filter, setFilter] = useState("");
  const [filterTobe, setFilterTobe] = useState("");

  const isEnglishCountry = countryCode === ""
                            ? null
                            : countryOptions.find((c) => c.name === countryCode)
                              ? !!countryOptions.find((c) => c.name === countryCode)?.isEnglish
                              : null;

  const handleSearchCountryTemplate = async () => {
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

      const { data } = await axios.post(`${BASE_URL}/get-template-details`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const codeChanges = data.codeChanges || [];
      
      if (data.templateId) setTemplateId(data.templateId);

      const nonAssetCodeChanges = codeChanges
                                    .filter((it) => !isAssetCode(it.aswas_code))
                                    .map( it => ({
                                      id: it.id,
                                      ppt_no: it.ppt_no || "",
                                      aswas_code: it.aswas_code?.trim() || "",
                                      tobe_code: it.tobe_code?.trim() || "",
                                      // localized_tobe_code: it.localized_tobe_code?.trim() || "",
                                      localized_tobe_code: "",
                                    }) );

      const newTextareas = nonAssetCodeChanges.map((pair) => ({
        id: pair.id,
        pptNo: pair.ppt_no,
        asWasCode: pair.aswas_code,
        toBeCode: pair.tobe_code,
        // localizedToBeCode: pair.localized_tobe_code,
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

  const handleLocalizedToBeCodeChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, localizedToBeCode: value } : textarea
    );
    setTextareas(newTextareas);
  };
  const handleNonAssetPptNoChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, pptNo: value } : textarea
    );
    setTextareas(newTextareas);
  };
  const removeNonAssetTextArea = (index) => {
    const newTextareas = textareas.filter((textarea, i) => index !== i);
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
    handleCountryChange,
    handleSearchCountryTemplate,
    handleAsWasCodeChange,
    handleToBeCodeChange,
    handleNonAssetPptNoChange,
    filterTextareas,
    filter,
    filterTobe,
    templateId,
    // handleLocalizedToBeCodeChange,
    // removeNonAssetTextArea,
    // handleCheckedChange,
  };
};