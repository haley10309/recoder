import React from "react";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";
import CheckTemplate from "@/Components/Common/CheckTemplate";

import { useFetchTemplate } from "@/hooks/useFetchTemplate";
import { useCheckTemplate } from "./hooks/useCheckTemplate";
import { useFileUpload } from "./hooks/useFileUpload";

import CodeChangesEditor from "./components/CodeChangesEditor";
import UploadFiles from "./components/UploadFiles";

import "./CodeTemplates.scss";

const CodeTemplatesScreen = () => {
  const {
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    saveType,
    originalHtmlFile,
    setOriginalHtmlFile,
    addTextArea,
    removeTextArea,
    countOccurrences,
    handleSaveTemplate,
    checkHasInvalidAsWasCount,
    codeChanges,
    setCodeChanges,
    handlePptNoChange,
    handleAswasChange,
    handleTobeChange,
    handleGetTemplate,
  } = useCheckTemplate();

  const {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
  } = useFetchTemplate({ shouldFetchOnMount: true, ticketNum, ticketUrl });

  const {
    pptFile,
    backUpFile,
    handlePptFileChange,
    handleBackUpHtmlFileChange,
  } = useFileUpload({ setCodeChanges, setOriginalHtmlFile });

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText text={"As-Was, To-Be 코드 템플릿 관리"} />
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
        handleGetTemplate={handleGetTemplate}
      />
      <Gap gap={50} />

      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <UploadFiles
        pptFile={pptFile}
        backUpFile={backUpFile}
        handlePptFileChange={handlePptFileChange}
        handleBackUpHtmlFileChange={handleBackUpHtmlFileChange}
      />
      <Gap gap={50} />

      <TitleLabel text="✅ AS-WAS / TO-BE 템플릿" />
      <Gap gap={15} />
      <CodeChangesEditor
        saveType={saveType}
        addTextArea={addTextArea}
        removeTextArea={removeTextArea}
        originalHtmlFile={originalHtmlFile}
        countOccurrences={countOccurrences}
        handleSaveTemplate={handleSaveTemplate}
        checkHasInvalidAsWasCount={checkHasInvalidAsWasCount}
        codeChanges={codeChanges}
        handlePptNoChange={handlePptNoChange}
        handleAswasChange={handleAswasChange}
        handleTobeChange={handleTobeChange}
      />
    </div>
  );
};

export default CodeTemplatesScreen;
