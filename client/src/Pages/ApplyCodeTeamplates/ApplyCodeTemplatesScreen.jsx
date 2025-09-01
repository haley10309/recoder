import React from "react";
import styled from "styled-components";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";

import { useSearchTemplate } from "./hooks/useSearchTemplate";
import { useFileUpload } from "./hooks/useFileUpload";
import { useTranslationUpload } from "./hooks/useTranslationUpload";

import CheckTemplate from "./components/CheckTemplate";
import FileConvert from "./components/FileConvert";
import TableSection from "./components/TableSection";

const ApplyCodeTemplatesScreen = () => {
  const {
    countryCode,
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    isEnglishCountry,
    textareas,
    setTextareas,
    handleCountryChange,
    handleSearchCountryTemplate,
    handleAsWasCodeChange,
    handleToBeCodeChange,
    handleLocalizedToBeCodeChange,
    handleNonAssetPptNoChange,
    removeNonAssetTextArea,
    handleCheckedChange,
    filterTextareas,
    filter,
    filterTobe,
    templateId,
    templateByCountryId,
    addTextArea,
    handleSaveTemplate,
    handleDeleteCountryTemplate,
  } = useSearchTemplate();

  // HTML 파일 업로드 훅
  const {
    originalFile,
    fileContent,
    fileName,
    htmlUploadStatus,
    handleBackupFileUpload,
  } = useFileUpload();

  // 번역덱 업로드 훅
  const {
    translationMap,
    txtUploadStatus,
    txtFileName,
    handleTranslationTxtUpload,
  } = useTranslationUpload(countryCode);

  const copyList = Object.values(translationMap);

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText text={"Code Template 기반으로 국가별 실제 as-was → to-be 코드 매핑 적용"} />
      <Gap gap={50} />

      <TitleLabel text="📄 템플릿 불러오기" />
      <Gap gap={15} />
      <CheckTemplate
        ticketNum={ticketNum}
        ticketUrl={ticketUrl}
        setTicketNum={setTicketNum}
        setTicketUrl={setTicketUrl}
        countryCode={countryCode}
        handleCountryChange={handleCountryChange}
        handleSearchCountryTemplate={handleSearchCountryTemplate}
        isEnglishCountry={isEnglishCountry}
        templateId={templateId}
        templateByCountryId={templateByCountryId}
        handleDeleteCountryTemplate={handleDeleteCountryTemplate}
      />
      <Gap gap={50} />
  

      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <FileConvert
        ticketNum={ticketNum}
        ticketUrl={ticketUrl}
        textareas={textareas}
        setTextareas={setTextareas}
        countryCode={countryCode}
        isEnglishCountry={isEnglishCountry}
        originalFile={originalFile}
        fileContent={fileContent}
        fileName={fileName}
        htmlUploadStatus={htmlUploadStatus}
        handleBackupFileUpload={handleBackupFileUpload}
        translationMap={translationMap}
        txtUploadStatus={txtUploadStatus}
        txtFileName={txtFileName}
        handleTranslationTxtUpload={handleTranslationTxtUpload}
      />
      <Gap gap={50} />

      <TitleLabel text="👀 AS-WAS / TO-BE / Localization(for 비영문국) 확인하기" />
      <Gap gap={15} />
      <WhiteBox>
        {/* <FilterSection
          filter={filter}
          setFilter={setFilter}
          filterTobe={filterTobe}
          setFilterTobe={setFilterTobe}
        /> */}
        <TableSection
          filteredTextareas={filterTextareas()}
          countryCode={countryCode}
          handleAsWasCodeChange={handleAsWasCodeChange}
          handleToBeCodeChange={handleToBeCodeChange}
          handleLocalizedToBeCodeChange={handleLocalizedToBeCodeChange}
          handleCheckedChange={handleCheckedChange}
          handleNonAssetPptNoChange={handleNonAssetPptNoChange}
          removeNonAssetTextArea={removeNonAssetTextArea}
          filter={filter}
          filterTobe={filterTobe}
          isEnglishCountry={isEnglishCountry}
          hasOriginalFile={!!originalFile}
          copyList={copyList}
        />
      </WhiteBox>
      <Gap gap={50} />
    </div>
  );
};

export default ApplyCodeTemplatesScreen;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
`;
