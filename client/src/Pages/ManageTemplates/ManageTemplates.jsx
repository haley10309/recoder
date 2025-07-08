import React from "react";
import CheckTemplate from "../../Components/CheckTemplate/CheckTemplate";
import UploadFiles from "./UploadFiles";
import "@/Pages/ManageTemplates/ManageTemplates.scss";
import { useCheckTemplate } from "@/hooks/CheckTemplate/useCheckTemplate";
import CodeChangesEditor from "@/Components/CodeChangesEditor/CodeChangesEditor";
import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";

const ManageTemplates = () => {
  const {
      ticketNum,
      setTicketNum,
      ticketUrl,
      setTicketUrl,
      saveType,
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
      checkForExistingTemplate,
  } = useCheckTemplate();

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <TitleLabel text="📄 템플릿 불러오기" />
      <Gap gap={15} />
      <CheckTemplate
        ticketNum={ticketNum}
        ticketUrl={ticketUrl}
        setTicketNum={setTicketNum}
        setTicketUrl={setTicketUrl}
        onClick={() => checkForExistingTemplate("edit-template")}
      />
      <Gap gap={50} />

      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <UploadFiles
        isUploadOnlyOriginHtmlFile={false}
        setOriginalHtmlFile={setOriginalHtmlFile} 
        setAssetCodeChanges={setAssetCodeChanges}
        setNonAssetCodeChanges={setNonAssetCodeChanges}
      />
      <Gap gap={50} />

      <TitleLabel text="✅ AS-WAS / TO-BE 템플릿" />
      <Gap gap={15} />
      <CodeChangesEditor
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

export default ManageTemplates;
