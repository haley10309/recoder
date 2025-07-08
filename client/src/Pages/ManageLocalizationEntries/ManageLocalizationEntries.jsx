import React from "react";

import CheckTemplate from "@/Components/CheckTemplate/CheckTemplate";
import { useCheckTemplate } from "@/hooks/CheckTemplate/useCheckTemplate";
import TransFileUpload from "./TransFileUpload";
import CodeChangesEditor from "@/Components/CodeChangesEditor/CodeChangesEditor";
import UploadFiles from "../ManageTemplates/UploadFiles";
import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import LocalizationEntriesEditor from "./LocalizationEntriesEditor";

const ManageLocalizationEntries = () => {
  const {
      ticketNum,
      setTicketNum,
      ticketUrl,
      setTicketUrl,
      saveType,
      isTemplateCreated,
      localizationEntries,
      setLocalizationEntries,
      setDeleteIds,
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
      hasL10nUploadHistory,
      handleCreateOrUpdateLocalization,
      canUploadTransFile,
      englishCopyList,
      setEnglishCopyList,
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
        hasL10nUploadHistory={hasL10nUploadHistory}
        nonAssetCodeChanges={nonAssetCodeChanges}
        setEnglishCopyList={setEnglishCopyList}
        setLocalizationEntries={setLocalizationEntries}
      />
      <Gap gap={50} />

      <TitleLabel text={`🌐 로컬라이제이션 템플릿`} />
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

export default ManageLocalizationEntries;
