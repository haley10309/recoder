import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";

import CheckTemplate from "@/Components/CheckTemplate/CheckTemplate";
import { useCheckTemplate } from "@/hooks/CheckTemplate/useCheckTemplate";
import TransFileUpload from "./TransFileUpload";
import CodeChangesEditor from "@/Components/CodeChangesEditor/CodeChangesEditor";
import UploadFiles from "../EditTemplate/UploadFiles";
import TransBox from "@/Components/Common/TransBox";
import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";

const EditLocalizationEntries = () => {
  const {
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
      setDeleteIds, // TODO: editLocalizaionEntries에서 delete 어떻게 활용중인지 보기
      setTemplateID,
      originalHtmlFile,
      setOriginalHtmlFile,
      addNonAssetTextArea,
      removeNonAssetTextArea,
      addAssetArea,
      removeAssetArea,
      handleAssetAsWasChange,
      handleAssetToBeChange,
      handleAssetPptNoChange,
      countOccurrences,
      handleSaveTemplate,
      checkHasInvalidAsWasCount,
      nonAssetCodeChanges,
      setNonAssetCodeChanges,
      setAssetCodeChanges,
      handleNonAssetPptNoChange,
      handleNonAssetAswasChange,
      handleNonAssetTobeChange,
  } = useCheckTemplate();

  const [project, setProject] = useState("");
  const [pdp, setPdp] = useState("");
  const [product, setProduct] = useState("");
  const [filename, setFilename] = useState("파일을 선택해주세요");
  const [validCountries, setValidCountries] = useState([]);
  const [translationData, setTranslationData] = useState({});
  
  // states
  const [englishCopyList, setEnglishCopyList] = useState([]);
  const tobeCodes = nonAssetCodeChanges.map((item) => item.tobe_code);
  
  const canUploadTransFile = isTemplateCreated;

  // 로컬라이제이션 생성
  const handleCreateOrUpdateLocalization = async () => {
    // TODO: 이외 다른 조건도 모두 체크
    // if (!isTemplateCreated) {
    //   alert("템플릿을 먼저 생성해 주세요.");
    //   return;
    // }

    // try {
    //   const body = { 
    //     ticket_num: ticketNum, 
    //     ticket_url: ticketURL, 
    //     localizationEntries: 
    //       localizationEntries.map((item) => (
    //         item.id 
    //           ? { id: item.id, code_context: item.code_context }
    //           : { code_context: item.code_context }
    //       )), 
    //     delete_ids: deleteIds,
    //   };
      
    //   await axios.put(`${BASE_URL}/localization/template`, body, { headers: { "Content-Type": "application/json" } });
    //   setDeleteIds([]);
    //   const { data } = await axios.post(`${BASE_URL}/get-template-details`, { ticket_num: ticketNum, ticket_url: ticketURL });
    //   setLocalizationEntries(data.localizationEntries || []);
    //   alert(saveType === "update" ? "로컬라이제이션 템플릿이 수정되었습니다" : "로컬라이제이션 템플릿이 생성되었습니다");
    // } catch (err) {
    //   console.error("[Error] handleCreateOrUpdateLocalization", err);
    //   alert(saveType === "update" ? "로컬라이제이션 수정 중 오류가 발생했습니다" : "로컬라이제이션 생성 중 오류가 발생했습니다");
    // }
  };

  useEffect(() => {
    // setValidCountries(localizationDummyData.validCountries);
    // setTranslationData(localizationDummyData.translationData);
  }, []);

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <TitleLabel text="📄 템플릿 불러오기" />
      <Gap gap={15} />
      <CheckTemplate
        path="edit-localization-entries"
        ticketNum={ticketNum}
        ticketURL={ticketURL}
        setTicketNum={setTicketNum}
        setTicketURL={setTicketURL}
        setTemplateID={setTemplateID}
        setIsTemplateCreated={setIsTemplateCreated}
        setLocalizationEntries={setLocalizationEntries}
        setSaveType={setSaveType}
        setDeleteIds={setDeleteIds}
        setAssetCodeChanges={setAssetCodeChanges}
        setNonAssetCodeChanges={setNonAssetCodeChanges}
      />
      <Gap gap={50} />

      <TitleLabel text="📤 파일 업로드(선택)" />
      <Gap gap={15} />
      <UploadFiles
        isUploadOnlyOriginHtmlFile={true}
        setOriginalHtmlFile={setOriginalHtmlFile} 
        setAssetCodeChanges={setAssetCodeChanges}
        setNonAssetCodeChanges={setNonAssetCodeChanges}
      />
      <Gap gap={50} />
      
      <TitleLabel text="✅ AS-WAS / TO-BE 템플릿 (코드 출현 횟수 확인용)" />
      <Gap gap={15} />
      <CodeChangesEditor
        checkOnlyInvalidCount={true}
        saveType={saveType}
        addAssetArea={addAssetArea}
        removeAssetArea={removeAssetArea}
        addNonAssetTextArea={addNonAssetTextArea}
        removeNonAssetTextArea={removeNonAssetTextArea}
        originalHtmlFile={originalHtmlFile}
        countOccurrences={countOccurrences}
        handleAssetPptNoChange={handleAssetPptNoChange}
        handleAssetAsWasChange={handleAssetAsWasChange}
        handleAssetToBeChange={handleAssetToBeChange}
        handleSaveTemplate={handleSaveTemplate}
        checkHasInvalidAsWasCount={checkHasInvalidAsWasCount}
        nonAssetCodeChanges={nonAssetCodeChanges}
        handleNonAssetPptNoChange={handleNonAssetPptNoChange}
        handleNonAssetAswasChange={handleNonAssetAswasChange}
        handleNonAssetTobeChange={handleNonAssetTobeChange}
      />
      <Gap gap={50} />

      <TitleLabel text="📤 번역 파일 업로드" />
      <Gap gap={15} />
      <TransFileUpload
        isTemplateCreated={isTemplateCreated}
        tobeCodes={tobeCodes}
        setEnglishCopyList={setEnglishCopyList}
        setLocalizationEntries={setLocalizationEntries}
      />
      <Gap gap={50} />

      <TitleLabel text="🌐 로컬라이제이션 템플릿" />
      <Gap gap={15} />
      <div className="flex flex-col">
        {localizationEntries.map((item, idx) => (
          <TransBox
            key={idx}
            itemId={item.id}
            text={item.code_context}
            highlights={englishCopyList}
            onChange={(newTxt) => {
              setLocalizationEntries((prev) => {
                const a = [...prev];
                a[idx].code_context = newTxt;
                return a;
              });
            }}
            onDelete={() => {
              // TODO: id 활용 부분 전부 다시 체크
              setLocalizationEntries((prev) => prev.filter((_, i) => i !== idx));
              if (item.id) setDeleteIds((prev) => [...prev, item.id]);
            }}
          />
        ))}
      </div>
      <div className="flex gap-[15px] save_button_div mt-[50px]">
        <button
          className="plus-button rounded-[10px]"
          onClick={() => setLocalizationEntries((prev) => [...prev, { code_context: "" }])}
        >
          <AddIcon />
          <span className="ml-2">항목 추가</span>
        </button>
        <button 
          type="button" 
          className="save_button" 
          onClick={handleCreateOrUpdateLocalization} 
          disabled={!canUploadTransFile}
        >
          {saveType === "update" ? ` 로컬라이제이션 템플릿 수정` : ` 로컬라이제이션 템플릿 생성`}
        </button>
      </div>
    </div>
  );
};

export default EditLocalizationEntries;
