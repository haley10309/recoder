import { useState } from "react";

import { useFetchTemplate } from "@/hooks/useFetchTemplate";

import { isAssetCode, kind_countOccurrences } from "@/utils/codeUtils";
import defaultAxios from "@/apis/defaultAxios";

export const useTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");
  
  const {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
  } = useFetchTemplate({ shouldFetchOnMount: true, ticketNum, ticketUrl });

  const [saveType, setSaveType] = useState(""); // 'create' | 'update'
  const [codeChanges, setCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "", variations: [] }]);
  const [backupHtmlContent, setBackupHtmlContent] = useState("");

  // handlers
  const addTextArea = () => {
    setCodeChanges(prev => [...prev, { ppt_no: "", aswas_code: "", tobe_code: "", variations: [] }])
  };
  const removeTextArea = (idx) => {
    setCodeChanges((prev) => prev.filter((_, i) => i !== idx))
  };
  const addVariation = (itemIdx) => {
    setCodeChanges(prev =>
      prev.map((item, idx) => {
        if (idx !== itemIdx) return item;

        return {
          ...item,
          variations: [
            ...(item.variations ?? []),
            {
              aswas_code_variation: "",
              tobe_code_variation: "",
              description: "",
              countries: []
            }
          ]
        };
      })
    );
  };
  const removeVariation = (itemIdx, variationIdx) => {
    setCodeChanges(prev => {
      const updated = [...prev];
      updated[itemIdx].variations.splice(variationIdx, 1);
      return updated;
    });
  };
  const handleVariationChange = (
    itemIdx,
    variationIdx,
    field,
    value
  ) => {
    setCodeChanges(prev => {
      const updated = [...prev];
      updated[itemIdx].variations[variationIdx][field] = value;
      return updated;
    });
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

  const countOccurrences = (asWasCode) => kind_countOccurrences(backupHtmlContent, asWasCode);

  const checkHasInvalidAsWasCount = () => {
    return codeChanges.some(item => countOccurrences(item.aswas_code) !== 1);
  };

  /**
   * @param path 'edit-template' | 'edit-localization-entries' // 페이지 종류에 따라 템플릿 불러오기에 따른 안내문구가 다름
   */
  const checkAndGetTemplateIfExist = async (path) => {
    try {
      // 1) 템플릿 존재 여부 확인
      const response = await defaultAxios.post(`/check-template-exsist`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const data = response.data;

      const isTemplateExist = data.isTemplateExist;
      if (isTemplateExist) {
        alert(`${ticketUrl} 템플릿을 불러왔습니다.`);
        setSaveType("update");

        // 2) 세부 내용 가져오기
        const detailRes = await defaultAxios.post(`/get-template-details`, {
          ticket_num: ticketNum,
          ticket_url: ticketUrl,
        });
        const detailData = detailRes.data;

        const _codeChanges = (detailData.codeChanges ?? [])
                                      .filter((it) => !isAssetCode(it.aswas_code)) // TODO Later: asset 아닌 코드만 필터링중인데, 쭉 유지할지 결정 필요
                                      .map( it => ({
                                        id: it.id,
                                        ppt_no: it.ppt_no || "",
                                        aswas_code: it.aswas_code?.trim() || "",
                                        tobe_code: it.tobe_code?.trim() || "",
                                        variations: it.variations ?? []
                                      }) );

        setCodeChanges(_codeChanges);
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
    }
  };

  // 템플릿 저장
  const handleSaveTemplate = async () => {
    // AS-WAS/TO-BE validation: 동시에 비어있는 row 차단
    // 💡 Variation도 동일하게 검사해야 할지 검토 필요 !!
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
        await defaultAxios.post(`/create-template`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        const formData = new FormData();
        formData.append("ticket_num", ticketNum);
        formData.append("ticket_url", ticketUrl);
        formData.append("code_changes", JSON.stringify(codeChanges));
        await defaultAxios.post(`/update-template`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      }
      setSaveType("update");
      alert("템플릿이 성공적으로 저장되었습니다");

      // codeChanges 업데이트
      const detailRes = await defaultAxios.post(`/get-template-details`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
      const detailData = detailRes.data;
      const _codeChanges = (detailData.codeChanges ?? [])
                                    .filter((it) => !isAssetCode(it.aswas_code)) // TODO Later: asset 아닌 코드만 필터링중인데, 쭉 유지할지 결정 필요
                                    .map( it => ({
                                      id: it.id,
                                      ppt_no: it.ppt_no || "",
                                      aswas_code: it.aswas_code?.trim() || "",
                                      tobe_code: it.tobe_code?.trim() || "",
                                    }) );

      setCodeChanges(_codeChanges);
    } catch (err) {
    }
  };

  const handleGetTemplate = () => {
    checkAndGetTemplateIfExist("edit-template");
  };

  return {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
    ticketNum,
    ticketUrl,
    setTicketNum,
    setTicketUrl,
    saveType,
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
    setBackupHtmlContent,
    addVariation,
    handleVariationChange,
    removeVariation,
  };
};
