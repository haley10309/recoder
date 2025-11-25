import { useState } from "react";
import axios from "axios";

import { isAssetCode } from "@/utils/codeUtils";
import { BASE_URL } from "@/utils/routePath";

export const useTranslationTemplate = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketUrl, setTicketUrl] = useState("");

  // Save flags
  const [saveType, setSaveType] = useState(""); // 'create' | 'update'
  const [isTemplateCreated, setIsTemplateCreated] = useState(false); // 템플릿이 이미 만들어져 있으면 true로
  const [localizationEntries, setLocalizationEntries] = useState([{ code_context: "" }]); // copy 적용 필요한 tobe_code를 모아둔 리스트
  const [deleteIds, setDeleteIds] = useState([]);
  const [englishCopyList, setEnglishCopyList] = useState([]);
  const [codeChanges, setCodeChanges] = useState([{ ppt_no: "", aswas_code: "", tobe_code: "" }]);
  const [transFile, setTransFile] = useState(null);

  const canUploadTransFile = isTemplateCreated;

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

        const codeChanges = (detailData.codeChanges ?? [])
                                      .filter((it) => !isAssetCode(it.aswas_code))
                                      .map( it => ({
                                        id: it.id,
                                        ppt_no: it.ppt_no || "",
                                        aswas_code: it.aswas_code?.trim() || "",
                                        tobe_code: it.tobe_code?.trim() || "",
                                      }) );
        const localizationEntries = detailData.localizationEntries || [];

        setCodeChanges(codeChanges);
        
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
  
  const handleTransSubmit = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      // 1. englishCopyList 받아오고 업데이트
      const res = await axios.post(
        `${BASE_URL}/extract-english-copy-list`, 
        formData, 
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      const englishCopyList = res.data.englishCopyList;
      setEnglishCopyList(englishCopyList);

      if (localizationEntries.length === 0) {
        // 2. localizationEntries 업데이트 (localizationEntries 없을 때만)
        if (englishCopyList.length > 0) {
          // 이미 존재하는 codeChanges에서 번역이 필요한 item만 뽑아내기
          const items = codeChanges
                          .filter(({ tobe_code }) => englishCopyList.some((copyItem) => tobe_code.includes(copyItem)))
                          .map(({ tobe_code }) => ({ code_context: tobe_code }));
                          // TODO: codeChangeItem의 id를 넣으면 안되고... 기존에 있던 localizationEntries의걸 넣던가 해야됨. 기존에 있는 경우와 없는 경우 모두 생각해야됨.
          
          setLocalizationEntries(items)
        }
      }
    } catch (error) {
      console.error("Error uploading translation file:", error);
      alert("번역 업로드에 실패했습니다.");
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
      await axios.put(`${BASE_URL}/update-localization-entries`, body, { headers: { "Content-Type": "application/json" } });
      setDeleteIds([]);

      // db에 저장된 localizaionEntries 가져오기
      const { data } = await axios.post(`${BASE_URL}/get-template-details`, { ticket_num: ticketNum, ticket_url: ticketUrl });
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


  const handleTransFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTransFile(file);
    handleTransSubmit(file);
  };

  const handleGetTemplate = () => {
    checkForExistingTemplate("edit-localization-entries");
  };

  return {
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    saveType,
    localizationEntries,
    setLocalizationEntries,
    handleCreateOrUpdateLocalization,
    canUploadTransFile,
    englishCopyList,
    handleDeleteLocalizationEntry,
    handleTransFileChange,
    transFile,
    handleGetTemplate,
  };
};
