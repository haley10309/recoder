import React from "react";
import styled from "styled-components";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";

import { useSearchTemplate } from "./hooks/useSearchTemplate";
import { useFileUpload } from "./hooks/useFileUpload";

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
    handleNonAssetPptNoChange,
    filterTextareas,
    filter,
    templateId,
  } = useSearchTemplate();

  // HTML 파일 업로드 훅
  const {
    originalFile,
    fileContent,
    fileName,
    htmlUploadStatus,
    handleBackupFileUpload,
  } = useFileUpload();

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
      />
      <Gap gap={50} />
  

      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <FileConvert
        ticketUrl={ticketUrl}
        textareas={textareas}
        setTextareas={setTextareas}
        countryCode={countryCode}
        originalFile={originalFile}
        fileContent={fileContent}
        fileName={fileName}
        htmlUploadStatus={htmlUploadStatus}
        handleBackupFileUpload={handleBackupFileUpload}
      />
      <Gap gap={50} />

      <TitleLabel text="👀 AS-WAS / TO-BE / Localization(for 비영문국) 확인하기" />
      <Gap gap={15} />
      <WhiteBox>
        <TableSection
          filteredTextareas={filterTextareas()}
          countryCode={countryCode}
          handleAsWasCodeChange={handleAsWasCodeChange}
          handleToBeCodeChange={handleToBeCodeChange}
          filter={filter}
          isEnglishCountry={isEnglishCountry}
          hasOriginalFile={!!originalFile}
          handleNonAssetPptNoChange={handleNonAssetPptNoChange}
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
