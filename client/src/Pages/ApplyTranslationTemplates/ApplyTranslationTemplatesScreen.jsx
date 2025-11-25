import React, { useState } from "react";
import styled from "styled-components";
import AddIcon from "@mui/icons-material/Add";

import PageDescriptionText from "@/Components/Common/PageDescriptionText";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";
import CheckTemplate from "@/Components/Common/CheckTemplate";
import FileConvert from "./components/FileConvert";
import TableSection from "./components/TableSection";
import FileUploadSection from "./components/FileUploadSection";
import SiteCode from "@/Components/Common/SiteCode";

import { useFetchTemplate } from "@/hooks/useFetchTemplate";
import { useSearchTemplate } from "./hooks/useSearchTemplate";
import { useFileUpload } from "./hooks/useFileUpload";
import { useLocalizationApply } from "./hooks/useLocalizationApply";
import { useTranslationUpload } from "./hooks/useTranslationUpload";

const ApplyTranslationTemplatesScreen = () => {
  const [englishCopyList, setEnglishCopyList] = useState([]);

  const {
    countryCode,
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    isEnglishCountry,
    textareas,
    setTextareas,
    handleGetTemplate,
    handleCountryChange,
    handleToBeCodeChange,
    handleLocalizedToBeCodeChange,
    templateId,
    handleAddTextarea,
  } = useSearchTemplate();

  // HTML 파일 업로드 훅
  const {
    originalFile,
    fileContent: tobeFileContent,
    fileName,
    htmlUploadStatus,
    handleBackupFileUpload,
    countOccurrences,
  } = useFileUpload();
  
  const {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
  } = useFetchTemplate({ shouldFetchOnMount: true, ticketNum, ticketUrl });

  
  // 번역덱 업로드 훅
  const {
    translationMap,
    txtUploadStatus,
    txtFileName,
    handleTranslationTxtUpload,
    copyDeckFile,
  } = useTranslationUpload({ countryCode, setEnglishCopyList });

  // 로컬라이제이션 적용 훅
  const {
    localizationStatus,
    handleApplyLocalization,
    handleLocalizedDownload,
    isLocalizationApplied,
  } = useLocalizationApply({
    tobeFileContent,
    fileName,
    textareas,
    setTextareas,
    countryCode,
    translationMap,
  });
  
  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />
      
      <PageDescriptionText text={"국가별 To-Be HTML에 Translation Template + 카피덱을 적용해 번역 반영"} />
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
      <Gap gap={30} />
      <div>
        <div style={{ fontSize: "12px", color: "grey" }}>templateId: {templateId}</div>
      </div>
      <Gap gap={50} />

      <TitleLabel text="🌐 국가코드 선택" />
      <Gap gap={15} />
      <SiteCode
        countryCode={countryCode}
        handleCountryChange={handleCountryChange}
        isEnglishCountry={isEnglishCountry}
        isDisabled={!ticketNum || !ticketUrl}
      />
      <Gap gap={50} />
      


      {isEnglishCountry ? (
        <>
          <TitleLabel text="영문국은 번역 대상이 아닙니다" style={{ textAlign: "center" }} />
          <Gap gap={1000} />
        </>
      ) : (
        <>
          <TitleLabel text="📤 파일 업로드" />
          <Gap gap={15} />
          <FileUploadSection
            fileName={fileName}
            htmlUploadStatus={htmlUploadStatus}
            handleBackupFileUpload={handleBackupFileUpload}
            txtUploadStatus={txtUploadStatus}
            txtFileName={txtFileName}
            countryCode={countryCode}
            handleTranslationTxtUpload={handleTranslationTxtUpload}
          />
          <FileConvert
            ticketNum={ticketNum}
            ticketUrl={ticketUrl}
            isEnglishCountry={isEnglishCountry}
            fileName={fileName}
            handleApplyLocalization={handleApplyLocalization}
            handleLocalizedDownload={handleLocalizedDownload}
            localizationStatus={localizationStatus}
            isLocalizationApplied={isLocalizationApplied}
            copyDeckFile={copyDeckFile}
          />
          <Gap gap={50} />

          <TitleLabel text="✅ TO-BE / Localization TO-BE(for 비영문국) 확인하기" />
          <Gap gap={15} />
          <WhiteBox>
            <TableSection
              textareas={textareas}
              countryCode={countryCode}
              handleToBeCodeChange={handleToBeCodeChange}
              handleLocalizedToBeCodeChange={handleLocalizedToBeCodeChange}
              isEnglishCountry={isEnglishCountry}
              hasOriginalFile={!!originalFile}
              countOccurrences={countOccurrences}
              englishCopyList={englishCopyList}
            />
          </WhiteBox>

          <div className="flex gap-[15px] save_button_div">
            <button onClick={handleAddTextarea} className="plus-button rounded-[10px]">
              <AddIcon />
              <span className="ml-2">항목 추가</span>
            </button>
          </div>

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
