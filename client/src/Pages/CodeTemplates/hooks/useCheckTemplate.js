import { useState } from "react";
import axios from "axios";

import { isAssetCode, kind_countOccurrences } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";

export const useCheckTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");

  const [saveType, setSaveType] = useState(""); // 'create' | 'update'
  const [codeChanges, setCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "" }]);

  // File upload and content
  const [originalHtmlFile, setOriginalHtmlFile] = useState("");

  // handlers
  const addTextArea = () => {
    setCodeChanges(prev => [...prev, { ppt_no: "", aswas_code: "", tobe_code: "" }])
  };
  const removeTextArea = (idx) => {
    setCodeChanges((prev) => prev.filter((_, i) => i !== idx))
  };
  const handlePptNoChange = (i, v) => {
    const arr = [...codeChanges];
    arr[i].ppt_no = v;
    setCodeChanges(arr);
  };
  const handleAswasChange = (i, v) => {
    const arr = [...codeChanges];
    arr[i].aswas_code = v;
    setCodeChanges(arr);
  };
  const handleTobeChange = (i, v) => {
    const arr = [...codeChanges];
    arr[i].tobe_code = v;
    setCodeChanges(arr);
  };

  const countOccurrences = (asWasCode) => kind_countOccurrences(originalHtmlFile, asWasCode);

  const checkHasInvalidAsWasCount = () => {
    return codeChanges.some(item => countOccurrences(item.aswas_code) !== 1);
  };

  /**
   * @param path 'edit-template' | 'edit-localization-entries' // 페이지 종류에 따라 템플릿 불러오기에 따른 안내문구가 다름
   */
  const checkForExistingTemplate = async (path) => {
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

        // 2) 세부 내용 가져오기
        const detailRes = await axios.post(`${BASE_URL}/get-template-details`, {
          ticket_num: ticketNum,
          ticket_url: ticketUrl,
        });
        const detailData = detailRes.data;

        const codeChanges = (detailData.codeChanges ?? [])
                                      .filter((it) => !isAssetCode(it.aswas_code)) // TODO Later: asset 아닌 코드만 필터링중인데, 쭉 유지할지 결정 필요
                                      .map( it => ({
                                        id: it.id,
                                        ppt_no: it.ppt_no || "",
                                        aswas_code: it.aswas_code?.trim() || "",
                                        tobe_code: it.tobe_code?.trim() || "",
                                      }) );

        setCodeChanges(codeChanges);
      } else {
        setSaveType("create");
        
        if (path === 'edit-template') {
          alert("새로운 템플릿을 추가할 수 있습니다.");
        }
        if (path === 'edit-localization-entries') {
          alert("Code Template 페이지에서 먼저 템플릿을 생성해주세요.");
        }
      }
    } catch (error) {
      console.error("Error checking for existing templates:", error);
      alert("템플릿 확인 중 오류가 발생했습니다.");
    }
  };

  // 템플릿 저장
  const handleSaveTemplate = async () => {
    // AS-WAS/TO-BE validation: 동시에 비어있는 row 차단
    if (codeChanges.some(item => !item.aswas_code.trim() && !item.tobe_code.trim())) {
      alert("AS-WAS와 TO-BE 코드 중 최소 하나는 입력해 주세요.");
      return;
    }

    try {
      if (saveType === "create") {
        const formData = new FormData();
        formData.append("ticket_num", ticketNum);
        formData.append("ticket_url", ticketUrl);
        formData.append("code_changes", JSON.stringify(codeChanges));
        await axios.post(`${BASE_URL}/create-template`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        const formData = new FormData();
        formData.append("ticket_num", ticketNum);
        formData.append("ticket_url", ticketUrl);
        formData.append("code_changes", JSON.stringify(codeChanges));
        await axios.post(`${BASE_URL}/update-template`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setSaveType("update");
      alert("템플릿이 성공적으로 저장되었습니다");

      // codeChanges 업데이트
      const detailRes = await axios.post(`${BASE_URL}/get-template-details`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const detailData = detailRes.data;
      const codeChanges = (detailData.codeChanges ?? [])
                                    .filter((it) => !isAssetCode(it.aswas_code)) // TODO Later: asset 아닌 코드만 필터링중인데, 쭉 유지할지 결정 필요
                                    .map( it => ({
                                      id: it.id,
                                      ppt_no: it.ppt_no || "",
                                      aswas_code: it.aswas_code?.trim() || "",
                                      tobe_code: it.tobe_code?.trim() || "",
                                    }) );

      setCodeChanges(codeChanges);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "템플릿 저장 중 오류가 발생하였습니다");
    }
  };

  const handleGetTemplate = () => {
    checkForExistingTemplate("edit-template");
  };

  return {
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    saveType,
    originalHtmlFile,
    setOriginalHtmlFile,
    addTextArea,
    removeTextArea,
    countOccurrences,
    handleSaveTemplate,
    checkHasInvalidAsWasCount,
    codeChanges,
    setCodeChanges,
    handlePptNoChange,
    handleAswasChange,
    handleTobeChange,
    handleGetTemplate,
  };
};
