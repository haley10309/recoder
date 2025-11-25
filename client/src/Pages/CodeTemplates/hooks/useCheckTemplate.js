import { useState } from "react";
import axios from "axios";
import { useSetRecoilState } from "recoil";

import { isAssetCode, kind_countOccurrences } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";
import { nameEnState } from "@/recoil/atoms/state";

export const useCheckTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");

  const setNameEnState = useSetRecoilState(nameEnState);

  // Save flags
  const [saveType, setSaveType] = useState(""); // 'create' | 'update'

  // non-asset states
  const [nonAssetCodeChanges, setNonAssetCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "" }]);
  // asset states
  // const [assetCodeChanges, setAssetCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "" }]);
  const [assetCodeChanges, setAssetCodeChanges] = useState([]);

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

        // 2) 세부 내용 가져오기
        const detailRes = await axios.post(`${BASE_URL}/get-template-details`, {
          ticket_num: ticketNum,
          ticket_url: ticketUrl,
        });
        const detailData = detailRes.data;

        const codeChanges = detailData.codeChanges || [];
        // const localizationEntries = detailData.localizationEntries || [];

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

        setNonAssetCodeChanges(nonAssetCodeChanges);
        // setAssetCodeChanges(assetCodeChanges);
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
        formData.append("ticket_num", ticketNum);
        formData.append("ticket_url", ticketUrl);
        formData.append("code_changes", JSON.stringify(combinedCodeChanges));
        await axios.post(`${BASE_URL}/update-template`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setSaveType("update");
      alert("템플릿이 성공적으로 저장되었습니다");

      // assetCodeChanges, nonAssetCodeChanges 업데이트
      const detailRes = await axios.post(`${BASE_URL}/get-template-details`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const detailData = detailRes.data;
      const codeChanges = detailData.codeChanges || [];

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

      setNonAssetCodeChanges(nonAssetCodeChanges);
      // setAssetCodeChanges(assetCodeChanges);
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
    addNonAssetTextArea,
    removeNonAssetTextArea,
    countOccurrences,
    handleSaveTemplate,
    checkHasInvalidAsWasCount,
    nonAssetCodeChanges,
    setNonAssetCodeChanges,
    handleNonAssetPptNoChange,
    handleNonAssetAswasChange,
    handleNonAssetTobeChange,
    handleGetTemplate,

    // addAssetArea,
    // removeAssetArea,
    // handleAssetAsWasChange,
    // handleAssetToBeChange,
    // handleAssetPptNoChange,
    // assetCodeChanges,
    // setAssetCodeChanges,
  };
};
