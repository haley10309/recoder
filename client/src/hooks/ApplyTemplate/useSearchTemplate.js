import { useState } from "react";
import axios from "axios";

import { isAssetCode, kind_countOccurrences } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";
import { countryOptions } from "@/Components/Common/CoutryCode";

export const useSearchTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [isEnglishCountry, setIsEnglishCountry] = useState(false);
  const [textareas, setTextareas] = useState([{ asWasCode: "", toBeCode: "", checked: false, isApplied: null }]);
  const [countryCode, setCountryCode] = useState("");
  const [originalHtmlFile, setOriginalHtmlFile] = useState("");

  const [filter, setFilter] = useState("");
  const [filterTobe, setFilterTobe] = useState("");

  // 템플릿 조회
  const handleSearchTemplate = async () => {
    try {
      const { data } = await axios.post(`${BASE_URL}/get-template-details`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const codeChanges = data.codeChanges || [];

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

    const selected = countryOptions.find((c) => c.name === inputValue);
    if (selected && selected.isEnglish) {
      setIsEnglishCountry(true);
    } else {
      setIsEnglishCountry(false);
    }
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
  };
};
