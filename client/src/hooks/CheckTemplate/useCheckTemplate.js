import { useState } from "react";
import axios from "axios";

import { kind_countOccurrences } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";

export const useCheckTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketURL, setTicketURL] = useState("");

  // Save flags
  const [saveType, setSaveType] = useState(""); // 'create' | 'update'
  const [isTemplateCreated, setIsTemplateCreated] = useState(false); // 템플릿이 이미 만들어져 있으면 true로

  const [localizationEntries, setLocalizationEntries] = useState([{ code_context: "" }]); // copy 적용 필요한 tobe_code를 모아둔 리스트
  const [deleteIds, setDeleteIds] = useState([]);

  // non-asset states
  const [nonAssetCodeChanges, setNonAssetCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "" }]);
  // asset states
  const [assetCodeChanges, setAssetCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "" }]);

  // Template and ticket info
  const [templateID, setTemplateID] = useState("");
  // const isTemplateAvailable = Boolean(templateID);

  // File upload and content
  const [originalHtmlFile, setOriginalHtmlFile] = useState("");

  // Non-Asset handlers
  const addNonAssetTextArea = () => {
    setNonAssetCodeChanges(prev => [...prev, { ppt_no: "", aswas_code: "", tobe_code: "" }])
  };
  const removeNonAssetTextArea = (idx) => {
    setNonAssetCodeChanges((prev) => prev.filter((_, i) => i !== idx))
  };
  const handleNonAssetPptNoChange = (i, v) => {
    const arr = [...nonAssetCodeChanges];
    arr[i].ppt_no = v;
    setNonAssetCodeChanges(arr);
  };
  const handleNonAssetAswasChange = (i, v) => {
    const arr = [...nonAssetCodeChanges];
    arr[i].aswas_code = v;
    setNonAssetCodeChanges(arr);
  };
  const handleNonAssetTobeChange = (i, v) => {
    const arr = [...nonAssetCodeChanges];
    arr[i].tobe_code = v;
    setNonAssetCodeChanges(arr);
  };

  // Asset handlers
  const addAssetArea = () => {
    setAssetCodeChanges((prev) => [...prev, { ppt_no: "", aswas_code: "", tobe_code: "" }])
  };
  const removeAssetArea = (idx) => {
    setAssetCodeChanges((prev) => prev.filter((_, i) => i !== idx))
  };
  const handleAssetPptNoChange = (i, v) => {
    const arr = [...assetCodeChanges];
    arr[i].ppt_no = v;
    setAssetCodeChanges(arr);
  }
  const handleAssetAsWasChange = (i, v) => {
    const arr = [...assetCodeChanges];
    arr[i].aswas_code = v;
    setAssetCodeChanges(arr);
  }
  const handleAssetToBeChange = (i, v) => {
    const arr = [...assetCodeChanges];
    arr[i].tobe_code = v;
    setAssetCodeChanges(arr);
  }

  const countOccurrences = (asWasCode) => kind_countOccurrences(originalHtmlFile, asWasCode);

  // 템플릿 저장
  const handleSaveTemplate = async () => {
    // AS-WAS/TO-BE validation: 동시에 비어있는 row 차단
    if (nonAssetCodeChanges.some(item => !item.aswas_code.trim() && !item.tobe_code.trim())) {
      alert("AS-WAS와 TO-BE 코드 중 최소 하나는 입력해 주세요.");
      return;
    }

    const combinedCodeChanges = [...nonAssetCodeChanges, ...assetCodeChanges];
    try {
      if (saveType === "create") {
        const formData = new FormData();
        formData.append("ticket_num", ticketNum);
        formData.append("ticket_url", ticketURL);
        formData.append("code_changes", JSON.stringify(combinedCodeChanges));
        await axios.post(`${BASE_URL}/create-template`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        const formData = new FormData();
        formData.append("template_id", templateID);
        formData.append("code_changes", JSON.stringify(combinedCodeChanges));
        await axios.post(`${BASE_URL}/update-template`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setIsTemplateCreated(true);
      alert("템플릿이 성공적으로 저장되었습니다");
    } catch (err) {
      console.error(err);
      setIsTemplateCreated(false);
      alert("템플릿 저장 중 오류가 발생하였습니다");
    }
  };

  const checkHasInvalidAsWasCount = () => {
    return nonAssetCodeChanges.some(item => countOccurrences(item.aswas_code) !== 1);
  };

  return {
    ticketNum,
    setTicketNum,
    ticketURL,
    setTicketURL,
    saveType,
    setSaveType,
    isTemplateCreated,
    setIsTemplateCreated,
    localizationEntries,
    setLocalizationEntries,
    deleteIds,
    setDeleteIds,

    setTemplateID,
    originalHtmlFile,
    setOriginalHtmlFile,
    addNonAssetTextArea,
    removeNonAssetTextArea,
    addAssetArea,
    removeAssetArea,
    countOccurrences,
    handleSaveTemplate,
    checkHasInvalidAsWasCount,

    assetCodeChanges,
    nonAssetCodeChanges,
    setAssetCodeChanges,
    setNonAssetCodeChanges,
    handleAssetAsWasChange,
    handleAssetToBeChange,
    handleAssetPptNoChange,
    handleNonAssetPptNoChange,
    handleNonAssetAswasChange,
    handleNonAssetTobeChange,
  };
};
