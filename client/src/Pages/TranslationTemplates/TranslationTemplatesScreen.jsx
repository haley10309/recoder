import React from "react";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";

import { useTranslationTemplate } from "./hooks/useTranslationTemplate";
import { useFetchTemplate } from "@/hooks/useFetchTemplate";

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
    localizationEntries,
    setLocalizationEntries,
    checkForExistingTemplate,
    handleCreateOrUpdateLocalization,
    canUploadTransFile,
    englishCopyList,
    handleDeleteLocalizationEntry,
    handleTransFileChange,
    transFile,
  } = useTranslationTemplate();
    
    const {
      loading,
      ticketNumOptions,
      ticketUrlOptions,
    } = useFetchTemplate({ shouldFetchOnMount: true, ticketNum, ticketUrl });

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText text={"번역 적용할 code block 템플릿 관리"} />
      <Gap gap={50} />

      <TitleLabel text="📄 템플릿 불러오기" />
      <Gap gap={15} />
      <CheckTemplate
        loading={loading}
        ticketNumOptions={ticketNumOptions}
        ticketUrlOptions={ticketUrlOptions}
        ticketNum={ticketNum}
        ticketUrl={ticketUrl}
        handleTicketNumChange={setTicketNum}
        handleTicketUrlChange={setTicketUrl}
        onClick={() => checkForExistingTemplate("edit-localization-entries")}
      />
      <Gap gap={50} />

      <TitleLabel text="📤 번역 파일 업로드" />
      <Gap gap={15} />
      <TransFileUpload
        transFile={transFile}
        handleTransFileChange={handleTransFileChange}
      />
      <Gap gap={50} />

      <TitleLabel text={`🌐 로컬라이제이션 템플릿`} />
      <Gap gap={15} />
      <LocalizationEntriesEditor
        saveType={saveType}
        canUploadTransFile={canUploadTransFile}
        highlights={englishCopyList}
        localizationEntries={localizationEntries}
        setLocalizationEntries={setLocalizationEntries}
        handleCreateOrUpdateLocalization={handleCreateOrUpdateLocalization}
        handleDeleteLocalizationEntry={handleDeleteLocalizationEntry}
      />
    </div>
  );
};

export default TranslationTemplatesScreen;
