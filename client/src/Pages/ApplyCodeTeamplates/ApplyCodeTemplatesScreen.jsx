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
import { useFetchTemplate } from "./hooks/useFetchTemplate";
import FileUploadSection from "./components/FileUploadSection";
import { useFileExecute } from "./hooks/useFileExecute";

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
  
  const {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
  } = useFetchTemplate({ shouldFetchOnMount: true, ticketNum, ticketUrl });

  // 코드 실행 훅
  const {
    isProcessing,
    isExecuted,
    uploadProgress,
    uploadStatus,
    downloadedFileName,
    handleConvertByCountryCode,
    handleDownload,
  } = useFileExecute({
    originalFile,
    fileContent,
    textareas,
    setTextareas,
    countryCode,
    ticketUrl,
  });

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText text={"Code Template 기반으로 국가별 실제 as-was → to-be 코드 매핑 적용"} />
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
        countryCode={countryCode}
        handleCountryChange={handleCountryChange}
        handleSearchCountryTemplate={handleSearchCountryTemplate}
        isEnglishCountry={isEnglishCountry}
        templateId={templateId}
      />
      <Gap gap={50} />

      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <FileUploadSection
        fileName={fileName}
        htmlUploadStatus={htmlUploadStatus}
        handleBackupFileUpload={handleBackupFileUpload}
        countryCode={countryCode}
      />
      <FileConvert
        countryCode={countryCode}
        fileName={fileName}
        isProcessing={isProcessing}
        isExecuted={isExecuted}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        downloadedFileName={downloadedFileName}
        handleConvertByCountryCode={handleConvertByCountryCode}
        handleDownload={handleDownload}
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
