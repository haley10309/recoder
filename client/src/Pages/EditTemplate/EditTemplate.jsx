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
      assetCodeChanges,
      nonAssetCodeChanges,
      setNonAssetCodeChanges,
      setAssetCodeChanges,
      handleNonAssetPptNoChange,
      handleNonAssetAswasChange,
      handleNonAssetTobeChange,
  } = useCheckTemplate();

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      {/* 📄 템플릿 불러오기 */}
      <h2 className="font-bold text-black text-[16px] mb-[15px]">📄 템플릿 불러오기</h2>
      <CheckTemplate
        setLocalizationEntries={setLocalizationEntries}
        setDeleteIds={setDeleteIds}
        setAssetCodeChanges={setAssetCodeChanges}
        setNonAssetCodeChanges={setNonAssetCodeChanges}
      />

      {/* 📤 파일 업로드 */}
      <UploadFiles
        isUploadOnlyOriginHtmlFile={false}
        setOriginalHtmlFile={setOriginalHtmlFile} 
        setAssetCodeChanges={setAssetCodeChanges}
        setNonAssetCodeChanges={setNonAssetCodeChanges}
      />

      {/* ✅ AS-WAS / TO-BE 템플릿 */}
      <h2 className="font-bold text-black mb-5 text-[16px]">✅ AS-WAS / TO-BE 템플릿</h2>
      <TemplateCodeEditor
        checkOnlyInvalidCount={false}
        saveType={saveType}
        assetCodeChanges={assetCodeChanges}
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
    </div>
  );
};

export default EditTemplate;
