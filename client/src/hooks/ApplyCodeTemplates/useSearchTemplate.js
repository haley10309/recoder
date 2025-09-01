import { useEffect, useState } from "react";
import axios from "axios";

import { isAssetCode } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";
import { countryOptions } from "@/Components/Common/CoutryCode";

export const useSearchTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  const [textareas, setTextareas] = useState([{ asWasCode: "", toBeCode: "", localizedToBeCode: "", checked: false, isApplied: null }]);
  const [countryCode, setCountryCode] = useState("");
  const [templateId, setTemplateId] = useState(null);
  const [templateByCountryId, setTemplateByCountryId] = useState(null);

  const [filter, setFilter] = useState("");
  const [filterTobe, setFilterTobe] = useState("");

  const isEnglishCountry = countryCode === ""
                            ? null
                            : countryOptions.find((c) => c.name === countryCode)
                              ? !!countryOptions.find((c) => c.name === countryCode)?.isEnglish
                              : null;

  // 템플릿 조회
  const handleSearchTemplate = async () => {
    // try {
    //   const { data } = await axios.post(`${BASE_URL}/get-template-details`, {
    //     ticket_num: ticketNum,
    //     ticket_url: ticketUrl,
    //   });
    //   const codeChanges = data.codeChanges || [];
      
    //   if (data.templateId) setTemplateId(data.templateId);
    //   if (data.templateByCountryId) setTemplateByCountryId(data.templateByCountryId);

    //   // (250519 기준) aswas_code 기준으로 asset인지 non-asset인지 나눈다.
    //   const nonAssetCodeChanges = codeChanges
    //                                 .filter((it) => !isAssetCode(it.aswas_code))
    //                                 .map( it => ({
    //                                   id: it.id,
    //                                   ppt_no: it.ppt_no || "",
    //                                   aswas_code: it.aswas_code?.trim() || "",
    //                                   tobe_code: it.tobe_code?.trim() || "",
    //                                 }) );

    //   const newTextareas = nonAssetCodeChanges.map((pair) => ({
    //     asWasCode: pair.aswas_code,
    //     toBeCode: pair.tobe_code,
    //     pptNo: pair.ppt_no,
    //     checked: true,
    //   }));
    //   setTextareas(newTextareas);
    //   alert("성공적으로 템플릿을 불러왔습니다.");
    // } catch (error) {
    //   if (error.status === 404) {
    //     alert("존재하지 않는 템플릿입니다.");
    //     return;
    //   }
    //   console.error("🚨 Error fetching search template:", error);
    //   alert(`서버 요청에 실패했습니다. 콘솔을 확인해주세요. (${error.status})`);
    // }
  };

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

      // const { data } = await axios.post(`${BASE_URL}/get-country-template-details`, {
      //   ticket_num: ticketNum,
      //   ticket_url: ticketUrl,
      //   country_code: countryCode,
      // });
      const { data } = await axios.post(`${BASE_URL}/get-template-details`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const codeChanges = data.codeChanges || [];
      const localizationEntries = data.localizationEntries || [];
      
      if (data.templateId) setTemplateId(data.templateId);
      // if (data.templateByCountryId) setTemplateByCountryId(data.templateByCountryId);

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

  const handleDeleteCountryTemplate = async () => {
    if (!ticketNum || !ticketUrl || !countryCode) {
      alert("삭제할 템플릿의 정보인 Jira 티켓 번호/AEM Url/Site Code 를 먼저 입력해주세요");
      return;
    }
    if (!templateByCountryId) {
      alert("삭제할 templateByCountryId가 없어요");
      return;
    }

    const confirmDelete = confirm("정말 삭제할까요?");
    if (!confirmDelete) {
      return;
    }
    
    try {
      const { data } = await axios.delete(`${BASE_URL}/templates-by-country`, {
        data: {
          templateByCountryId,
        },
      });

      if (data.isDeleted) {
        setTemplateByCountryId(null);
        setTextareas([]);
        alert(`templateByCountryId가 ${templateByCountryId}인 ${countryCode}국가 템플릿을 삭제했어요!`);
      } else {
        alert(`templateByCountryId가 ${templateByCountryId}인 ${countryCode}국가 템플릿을 삭제하지 못했어요...`);
      }
    } catch (error) {
      alert(error.response.data.error 
              ? `${error.response.data.error} (${error.response.status})` 
              : `서버 요청에 실패했습니다. 콘솔을 확인해주세요. (${error.response.status})`
          );
    }
  };

  const addTextArea = () => {
    setTextareas(prev => [...prev, { pptNo: "", asWasCode: "", toBeCode: "", localizedToBeCode: "", checked: true }])
  };

  const handleSaveTemplate = async () => {
    if (!templateId) {
      alert("먼저 템플릿을 불러와주세요.");
      return;
    }
    
    // AS-WAS/TO-BE/Localized validation: 동시에 비어있는 row 차단
    if (textareas.some(item => !item.asWasCode.trim() || !item.toBeCode.trim())) {
      alert("비어있는 입력필드가 있으면, 템플릿을 저장할 수 없어요.");
      return;
    }

    try {
      const codeChanges = textareas.map((area) => ({
        id: area.id,
        pptNo: area.pptNo,
        asWasCode: area.asWasCode,
        toBeCode: area.toBeCode,
        localizedToBeCode: area.localizedToBeCode,
      }));

      const formData = new FormData();
      formData.append("templateId", String(templateId));
      formData.append("countryCode", countryCode);
      formData.append("codeChanges", JSON.stringify(codeChanges));
      const { data } = await axios.put(`${BASE_URL}/templates-by-country`, formData, { headers: { "Content-Type": "multipart/form-data" } });

      if (data.templateByCountryId) setTemplateByCountryId(data.templateByCountryId);

      const codeChanges_db = data.templateCodeChangesByCountry;

      const newTextAreas = codeChanges_db.map(item => ({
        id: item.id, 
        pptNo: item.ppt_no,
        asWasCode: item.aswas_code,
        toBeCode: item.tobe_code,
        localizedToBeCode: item.localized_tobe_code,
      }));
      setTextareas(newTextAreas);

      alert("템플릿을 성공적으로 저장했어요");
    } catch (err) {
      console.error('Apply Code Templates - handleSaveTemplate', err);
      alert(err.response.data.error || "템플릿 저장 중 오류가 발생하였습니다");
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
    handleSearchTemplate,
    handleCountryChange,
    handleAsWasCodeChange,
    handleToBeCodeChange,
    handleLocalizedToBeCodeChange,
    handleNonAssetPptNoChange,
    removeNonAssetTextArea,
    handleCheckedChange,
    filterTextareas,
    filter,
    filterTobe,
    handleSearchCountryTemplate,
    templateId,
    templateByCountryId,
    addTextArea,
    handleSaveTemplate,
    handleDeleteCountryTemplate,
  };
};
