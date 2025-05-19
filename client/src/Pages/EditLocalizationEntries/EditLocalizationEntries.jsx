import React, { useState } from "react";
import axios from "axios";

import CheckTemplate from "@/Components/CheckTemplate/CheckTemplate";
import { useCheckTemplate } from "@/hooks/CheckTemplate/useCheckTemplate";
import TransFileUpload from "./TransFileUpload";
import CodeChangesEditor from "@/Components/CodeChangesEditor/CodeChangesEditor";
import UploadFiles from "../EditTemplate/UploadFiles";
import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import LocalizationEntriesEditor from "./LocalizationEntriesEditor";
import { BASE_URL } from "@/utils/routePath";

const EditLocalizationEntries = () => {
  const {
      ticketNum,
      setTicketNum,
      ticketURL,
      setTicketURL,
      saveType,
      isTemplateCreated,
      localizationEntries,
      setLocalizationEntries,
      deleteIds,
      setDeleteIds, // TODO: editLocalizaionEntries에서 delete 어떻게 활용중인지 보기 - 하나는 데이터베이스에서 자동 추출이고 하나는 이렇게 deleteIds 써서, 통일이 필요하겠다.
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
      checkForExistingTemplate,
  } = useCheckTemplate();

  const [englishCopyList, setEnglishCopyList] = useState([]);
  const canUploadTransFile = isTemplateCreated;

  // 로컬라이제이션 생성
  const handleCreateOrUpdateLocalization = async () => {
    if (!canUploadTransFile) {
      alert("로컬라이제이션 템플릿을 저장할 수 없어요");
      return;
    }

    console.log("db 상 id 잘 포함되는지 확인! localizationEntries",localizationEntries)

    try {
      const body = {
        ticket_num: ticketNum,
        ticket_url: ticketURL,
        localization_entries:
          localizationEntries.map((item) => (
            item.id 
              ? { id: item.id, code_context: item.code_context }
              : { code_context: item.code_context }
          )),
        delete_ids: deleteIds,
      };
      
      // TemplateLocalizaionEntries 삽입/수정/삭제
      await axios.put(`${BASE_URL}/localization/template`, body, { headers: { "Content-Type": "application/json" } });
      setDeleteIds([]);

      // db에 저장된 localizaionEntries 가져오기
      const { data } = await axios.post(`${BASE_URL}/get-template-details`, { ticket_num: ticketNum, ticket_url: ticketURL });
      setLocalizationEntries(data.localizationEntries || []);

      alert(saveType === "update" ? "로컬라이제이션 템플릿이 수정되었습니다" : "로컬라이제이션 템플릿이 생성되었습니다");
    } catch (err) {
      console.error("[Error] handleCreateOrUpdateLocalization", err);
      alert(saveType === "update" ? "로컬라이제이션 수정 중 오류가 발생했습니다" : "로컬라이제이션 생성 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <TitleLabel text="📄 템플릿 불러오기" />
      <Gap gap={15} />
      <CheckTemplate
        ticketNum={ticketNum}
        ticketURL={ticketURL}
        setTicketNum={setTicketNum}
        setTicketURL={setTicketURL}
        onClick={() => checkForExistingTemplate("edit-localization-entries")}
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
        nonAssetCodeChanges={nonAssetCodeChanges}
        setEnglishCopyList={setEnglishCopyList}
        setLocalizationEntries={setLocalizationEntries}
      />
      <Gap gap={50} />

      <TitleLabel text="🌐 로컬라이제이션 템플릿" />
      <Gap gap={15} />
      <LocalizationEntriesEditor
        saveType={saveType}
        canUploadTransFile={canUploadTransFile}
        englishCopyList={englishCopyList}
        localizationEntries={localizationEntries}
        setLocalizationEntries={setLocalizationEntries}
        handleCreateOrUpdateLocalization={handleCreateOrUpdateLocalization}
        setDeleteIds={setDeleteIds}
      />
    </div>
  );
};

export default EditLocalizationEntries;
