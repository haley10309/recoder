import { useState } from "react";

import { useFetchTemplate } from "@/hooks/useFetchTemplate";

import { isAssetCode } from "@/utils/codeUtils";
import defaultAxios from "@/apis/defaultAxios";

export const useTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");

  const {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
  } = useFetchTemplate({ shouldFetchOnMount: true, ticketNum, ticketUrl });

  // Save flags
  const [saveType, setSaveType] = useState(""); // 'create' | 'update'
  const [isTemplateCreated, setIsTemplateCreated] = useState(false); // 템플릿이 이미 만들어져 있으면 true로
  const [localizationEntries, setLocalizationEntries] = useState([{ code_context: "" }]); // copy 적용 필요한 tobe_code를 모아둔 리스트
  const [deleteIds, setDeleteIds] = useState([]);
  const [englishCopyList, setEnglishCopyList] = useState([]);
  const [codeChanges, setCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "" }]);

  const canUploadTransFile = isTemplateCreated;

  /**
   * @param path 'edit-template' | 'edit-localization-entries' // 페이지 종류에 따라 템플릿 불러오기에 따른 안내문구가 다름
   */
  const checkAndGetTemplateIfExist = async (
    path
  ) => {
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
        setIsTemplateCreated(true);

        // 2) 세부 내용 가져오기
        const detailRes = await defaultAxios.post(`/get-template-details`, {
          ticket_num: ticketNum,
          ticket_url: ticketUrl,
        });
        const detailData = detailRes.data;

        const _codeChanges = (detailData.codeChanges ?? [])
                                      .filter((it) => !isAssetCode(it.aswas_code))
                                      .map( it => ({
                                        id: it.id,
                                        ppt_no: it.ppt_no || "",
                                        aswas_code: it.aswas_code?.trim() || "",
                                        tobe_code: it.tobe_code?.trim() || "",
                                      }) );
        const localizationEntries = detailData.localizationEntries || [];

        setCodeChanges(_codeChanges);
        
        // 템플릿 AS-WAS/TO-BE, 로컬라이제이션 세팅
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
      setIsTemplateCreated(false);
      setDeleteIds([]);
      setLocalizationEntries([{ code_context: "" }]);
      alert("템플릿 확인 중 오류가 발생했습니다.");
    }
  };

  // 로컬라이제이션 생성
  const handleCreateOrUpdateLocalization = async () => {
    if (!canUploadTransFile) {
      alert("로컬라이제이션 템플릿을 저장할 수 없어요");
      return;
    }

    try {
      const body = {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
        localization_entries:
          localizationEntries.map((item) => (
            item.id 
              ? { id: item.id, code_context: item.code_context }
              : { code_context: item.code_context }
          )),
        delete_ids: deleteIds,
      };
      
      // LocalizationEntries 삽입/수정/삭제
      await defaultAxios.put(`/update-localization-entries`, body, { headers: { "Content-Type": "application/json" } });
      setDeleteIds([]);

      // db에 저장된 localizaionEntries 가져오기
      const { data } = await defaultAxios.post(`/get-template-details`, { ticket_num: ticketNum, ticket_url: ticketUrl });
      setLocalizationEntries(data.localizationEntries || []);

      alert(saveType === "update" ? "로컬라이제이션 템플릿이 수정되었습니다" : "로컬라이제이션 템플릿이 생성되었습니다");
    } catch (err) {
      console.error("[Error] handleCreateOrUpdateLocalization", err);
      alert(saveType === "update" ? "로컬라이제이션 수정 중 오류가 발생했습니다" : "로컬라이제이션 생성 중 오류가 발생했습니다");
    }
  };

  const handleDeleteLocalizationEntry = (entryId, index) => {
    if (entryId) setDeleteIds((prev) => [...prev, entryId]);
    setLocalizationEntries((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGetTemplate = () => {
    checkAndGetTemplateIfExist("edit-localization-entries");
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
    localizationEntries,
    setLocalizationEntries,
    handleCreateOrUpdateLocalization,
    canUploadTransFile,
    englishCopyList,
    setEnglishCopyList,
    handleDeleteLocalizationEntry,
    handleGetTemplate,
    codeChanges,
  };
};
