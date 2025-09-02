import React from "react";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";

import { useCheckTemplate } from "./hooks/useCheckTemplate";

import CodeChangesEditor from "./components/CodeChangesEditor";
import CheckTemplate from "./components/CheckTemplate";
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
      addNonAssetTextArea,
      removeNonAssetTextArea,
      countOccurrences,
      handleSaveTemplate,
      checkHasInvalidAsWasCount,
      nonAssetCodeChanges,
      setAssetCodeChanges,
      setNonAssetCodeChanges,
      handleNonAssetPptNoChange,
      handleNonAssetAswasChange,
      handleNonAssetTobeChange,
      checkForExistingTemplate,
  } = useCheckTemplate();

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText text={"As-Was, To-Be 코드 템플릿 관리"} />
      <Gap gap={50} />

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
        addNonAssetTextArea={addNonAssetTextArea}
        removeNonAssetTextArea={removeNonAssetTextArea}
        originalHtmlFile={originalHtmlFile}
        countOccurrences={countOccurrences}
        handleSaveTemplate={handleSaveTemplate}
        checkHasInvalidAsWasCount={checkHasInvalidAsWasCount}
        nonAssetCodeChanges={nonAssetCodeChanges}
        handleNonAssetPptNoChange={handleNonAssetPptNoChange}
        handleNonAssetAswasChange={handleNonAssetAswasChange}
        handleNonAssetTobeChange={handleNonAssetTobeChange}
        // assetCodeChanges={assetCodeChanges}
        // addAssetArea={addAssetArea}
        // removeAssetArea={removeAssetArea}
        // handleAssetPptNoChange={handleAssetPptNoChange}
        // handleAssetAsWasChange={handleAssetAsWasChange}
        // handleAssetToBeChange={handleAssetToBeChange}
      />
    </div>
  );
};

export default CodeTemplatesScreen;
