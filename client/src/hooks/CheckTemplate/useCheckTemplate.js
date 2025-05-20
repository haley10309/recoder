import { useState } from "react";
import axios from "axios";

import { isAssetCode, kind_countOccurrences } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";

export const useCheckTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");

  // Save flags
  const [saveType, setSaveType] = useState(""); // 'create' | 'update'
  const [isTemplateCreated, setIsTemplateCreated] = useState(false); // 템플릿이 이미 만들어져 있으면 true로
  const [localizationEntries, setLocalizationEntries] = useState([{ code_context: "" }]); // copy 적용 필요한 tobe_code를 모아둔 리스트
  const [deleteIds, setDeleteIds] = useState([]);

  const hasL10nUploadHistory = localizationEntries.length > 0 && localizationEntries.some(entry => !!entry.id); // 템플릿에 이미 localizationEntry 업로드 히스토리가 있는지 (있으면 번역파일 업로드 막기 용도)
  
  // non-asset states
  const [nonAssetCodeChanges, setNonAssetCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "" }]);
  // asset states
  const [assetCodeChanges, setAssetCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "" }]);

  // Template and ticket info
  const [templateID, setTemplateID] = useState(""); // TODO: num,url로만 관리할수있으면 빼기 ? 

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

  const checkHasInvalidAsWasCount = () => {
    return nonAssetCodeChanges.some(item => countOccurrences(item.aswas_code) !== 1);
  };

  /**
   * @param path 'edit-template' | 'edit-localization-entries' // 페이지 종류에 따라 템플릿 불러오기에 따른 안내문구가 다름
   */
  const checkForExistingTemplate = async (
    path
  ) => {
    try {
      // 1) 템플릿 존재 여부 확인
      const response = await axios.post(`${BASE_URL}/check-template-exsist`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const data = response.data;

      const isTemplateExist = data.isTemplateExist;
      if (isTemplateExist) {
        alert(`${ticketUrl} 템플릿을 불러왔습니다.`);
        setSaveType("update");
        setIsTemplateCreated(true);

        // 2) 세부 내용 가져오기
        const detailRes = await axios.post(`${BASE_URL}/get-template-details`, {
          ticket_num: ticketNum,
          ticket_url: ticketUrl,
        });
        const detailData = detailRes.data;

        const templateId = detailData.templateId;
        const codeChanges = detailData.codeChanges || [];
        const localizationEntries = detailData.localizationEntries || [];

        // (250519 기준) aswas_code 기준으로 asset인지 non-asset인지 나눈다.
        const nonAssetCodeChanges = codeChanges
                                      .filter((it) => !isAssetCode(it.aswas_code))
                                      .map( it => ({
                                        id: it.id,
                                        ppt_no: it.ppt_no || "",
                                        aswas_code: it.aswas_code?.trim() || "",
                                        tobe_code: it.tobe_code?.trim() || "",
                                      }) );
        const assetCodeChanges = codeChanges
                                      .filter((it) => isAssetCode(it.aswas_code))
                                      .map( it => ({
                                        id: it.id,
                                        ppt_no: it.ppt_no || "",
                                        aswas_code: it.aswas_code?.trim() || "",
                                        tobe_code: it.tobe_code?.trim() || "",
                                      }) );

        setNonAssetCodeChanges(nonAssetCodeChanges);
        setAssetCodeChanges(assetCodeChanges);
        
        // 템플릿 AS-WAS/TO-BE, 로컬라이제이션 세팅
        setTemplateID(templateId);
        setDeleteIds([]);

        setLocalizationEntries(
          localizationEntries.map((it) => ({
            id: it.id,
            code_context: it.code_context,
          }))
        );

      } else {
        setSaveType("create");
        setIsTemplateCreated(false);
        setLocalizationEntries([{ code_context: "" }]);
        setDeleteIds([]);
        
        if (path === 'edit-template') {
          alert("새로운 템플릿을 추가할 수 있습니다.");
        }
        if (path === 'edit-localization-entries') {
          alert("Edit Template 페이지에서 먼저 템플릿을 생성해주세요.");
        }
      }
    } catch (error) {
      console.error("Error checking for existing templates:", error);
      alert("템플릿 확인 중 오류가 발생했습니다.");
      setIsTemplateCreated(false);
      setDeleteIds([]);
      setLocalizationEntries([{ code_context: "" }]);
    }
  };

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
        formData.append("ticket_url", ticketUrl);
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

  return {
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    saveType,
    isTemplateCreated,
    localizationEntries,
    setLocalizationEntries,
    deleteIds,
    setDeleteIds,
    checkForExistingTemplate,
    hasL10nUploadHistory,

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
