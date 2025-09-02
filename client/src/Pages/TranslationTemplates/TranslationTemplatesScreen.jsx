import React from "react";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";

import { useCheckTemplate } from "./hooks/useCheckTemplate";

import LocalizationEntriesEditor from "./components/LocalizationEntriesEditor";
import TransFileUpload from "./components/TransFileUpload";
import CheckTemplate from "./components/CheckTemplate";

const TranslationTemplatesScreen = () => {
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
    nonAssetCodeChanges,
    checkForExistingTemplate,
    hasL10nUploadHistory,
    handleCreateOrUpdateLocalization,
    canUploadTransFile,
    englishCopyList,
    setEnglishCopyList,
  } = useCheckTemplate();

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText text={"번역 적용할 code block 템플릿 관리"} />
      <Gap gap={50} />

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

export default TranslationTemplatesScreen;
