import React from "react";
import CheckTemplate from "../../Components/CheckTemplate/CheckTemplate";
import UploadFiles from "./UploadFiles";
import "@EditTemplate/EditTemplate.scss";
import { useCheckTemplate } from "@/hooks/CheckTemplate/useCheckTemplate";
import TemplateCodeEditor from "@/Components/TemplateCodeEditor/TemplateCodeEditor";

const EditTemplate = () => {
  const {
      ticketNum,
      setTicketNum,
      ticketURL,
      setTicketURL,
      saveType,
      setSaveType,
      setIsTemplateCreated,
      setLocalizationEntries,
      setDeleteIds,
      nonAssetAsWasCodes,
      setNonAssetAsWasCodes,
      nonAssetToBeCodes,
      setNonAssetToBeCodes,
      nonAssetPptNos,
      setNonAssetPptNos,
      assetAsWasCodes,
      setAssetAsWasCodes,
      assetToBeCodes,
      setAssetToBeCodes,
      assetPptNos,
      setAssetPptNos,
      setTemplateID,
      originalHtmlFile,
      setOriginalHtmlFile,
      addTextArea,
      removeTextArea,
      addAssetArea,
      removeAssetArea,
      handleAssetAsWasChange,
      handleAssetToBeChange,
      handleAssetPptNoChange,
      countOccurrences,
      handleSaveTemplate,
      checkHasInvalidAsWasCount,
  } = useCheckTemplate();

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      {/* 📄 템플릿 생성 또는 불러오기 */}
      <h2 className="font-bold text-black text-[16px] mb-[15px]">📄 템플릿 생성 또는 불러오기</h2>
      <CheckTemplate
        path="edit-template"
        ticketNum={ticketNum}
        ticketURL={ticketURL}
        setTicketNum={setTicketNum}
        setTicketURL={setTicketURL}
        setTemplateID={setTemplateID}
        setIsTemplateCreated={setIsTemplateCreated}
        setSaveType={setSaveType}
        setNonAssetPptNos={setNonAssetPptNos}
        setNonAssetAsWasCodes={setNonAssetAsWasCodes}
        setNonAssetToBeCodes={setNonAssetToBeCodes}
        setAssetPptNos={setAssetPptNos}
        setAssetAsWasCodes={setAssetAsWasCodes}
        setAssetToBeCodes={setAssetToBeCodes}
        setLocalizationEntries={setLocalizationEntries}
        setDeleteIds={setDeleteIds}
      />

      {/* 📤 파일 업로드 */}
      <UploadFiles
        isUploadOnlyOriginHtmlFile={false}
        setNonAssetPptNos={setNonAssetPptNos} 
        setNonAssetAsWasCodes={setNonAssetAsWasCodes} 
        setNonAssetToBeCodes={setNonAssetToBeCodes} 
        setAssetPptNos={setAssetPptNos} 
        setAssetAsWasCodes={setAssetAsWasCodes} 
        setAssetToBeCodes={setAssetToBeCodes} 
        setOriginalHtmlFile={setOriginalHtmlFile} 
      />

      {/* ✅ AS-WAS / TO-BE 템플릿 */}
      <h2 className="font-bold text-black mb-5 text-[16px]">✅ AS-WAS / TO-BE 템플릿</h2>
      <TemplateCodeEditor
        checkOnlyInvalidCount={false}
        saveType={saveType}
        assetPptNos={assetPptNos}
        assetAsWasCodes={assetAsWasCodes}
        assetToBeCodes={assetToBeCodes}
        nonAssetPptNos={nonAssetPptNos}
        nonAssetAsWasCodes={nonAssetAsWasCodes}
        nonAssetToBeCodes={nonAssetToBeCodes}
        addAssetArea={addAssetArea}
        removeAssetArea={removeAssetArea}
        addTextArea={addTextArea}
        removeTextArea={removeTextArea}
        originalHtmlFile={originalHtmlFile}
        countOccurrences={countOccurrences}
        handleAssetPptNoChange={handleAssetPptNoChange}
        handleAssetAsWasChange={handleAssetAsWasChange}
        handleAssetToBeChange={handleAssetToBeChange}
        setNonAssetPptNos={setNonAssetPptNos}
        setNonAssetAsWasCodes={setNonAssetAsWasCodes}
        setNonAssetToBeCodes={setNonAssetToBeCodes}
        handleSaveTemplate={handleSaveTemplate}
        checkHasInvalidAsWasCount={checkHasInvalidAsWasCount}
      />
    </div>
  );
};

export default EditTemplate;
