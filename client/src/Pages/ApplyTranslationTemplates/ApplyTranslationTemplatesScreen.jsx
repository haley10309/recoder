import React from "react";
import styled from "styled-components";

import PageDescriptionText from "@/Components/Common/PageDescriptionText";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";

import { useSearchTemplate } from "./hooks/useSearchTemplate";
import { useFileUpload } from "./hooks/useFileUpload";

import FileConvert from "./components/FileConvert";
import CheckTemplate from "./components/CheckTemplate";
import TableSection from "./components/TableSection";

const ApplyTranslationTemplatesScreen = () => {
  const {
    countryCode,
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    isEnglishCountry,
    textareas,
    setTextareas,
    handleSearchTemplate,
    handleCountryChange,
    handleAsWasCodeChange,
    handleToBeCodeChange,
    handleCheckedChange,
    filterTextareas,
    filter,
    filterTobe,
    templateId,
  } = useSearchTemplate();

  // HTML 파일 업로드 훅
  const {
    originalFile,
    fileContent: tobeFileContent,
    fileName,
    htmlUploadStatus,
    handleBackupFileUpload,
  } = useFileUpload();
  
  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />
      
      <PageDescriptionText text={"국가별 To-Be HTML에 Translation Template + 카피덱을 적용해 번역 반영"} />
      <Gap gap={50} />

      <TitleLabel text="🗺️ 국가코드 선택" />
      <Gap gap={15} />
      <CheckTemplate
        ticketNum={ticketNum}
        ticketUrl={ticketUrl}
        setTicketNum={setTicketNum}
        setTicketUrl={setTicketUrl}
        countryCode={countryCode}
        handleCountryChange={handleCountryChange}
        handleSearchCountryTemplate={handleSearchTemplate}
        isEnglishCountry={isEnglishCountry}
        templateId={templateId}
      />
      <Gap gap={25} />

      {isEnglishCountry ? (
        <>
          <TitleLabel text="영문국은 번역 대상이 아닙니다" style={{ textAlign: "center" }} />
          <Gap gap={1000} />
        </>
      ) : (
        <>
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
            tobeFileContent={tobeFileContent}
            fileName={fileName}
            htmlUploadStatus={htmlUploadStatus}
            handleBackupFileUpload={handleBackupFileUpload}
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
              handleCheckedChange={handleCheckedChange}
              filter={filter}
              filterTobe={filterTobe}
              isEnglishCountry={isEnglishCountry}
              hasOriginalFile={!!originalFile}
            />
          </WhiteBox>
          <Gap gap={50} />
        </>
      )}

    </div>
  );
};

export default ApplyTranslationTemplatesScreen;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
`;
