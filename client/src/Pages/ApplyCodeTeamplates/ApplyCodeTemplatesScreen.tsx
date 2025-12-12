import styled from "styled-components";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";
import CheckTemplate from "@/Components/Common/CheckTemplate";
import SiteCode from "@/Components/Common/SiteCode";
import FileConvert from "./components/FileConvert";
import TableSection from "./components/TableSection";
import FileUploadSection from "./components/FileUploadSection";

import { useTemplate } from "./hooks/useTemplate";
import { useFileUpload } from "./hooks/useFileUpload";
import { useFileExecute } from "./hooks/useFileExecute";

const ApplyCodeTemplatesScreen = () => {
  const {
    loading,
    ticketNumOptions,
    ticketUrlOptions,
    countryCode,
    ticketNum, 
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    isEnglishCountry,
    textareas,
    setTextareas,
    handleCountryChange,
    handleGetTemplate,
    handleAsWasCodeChange,
    handleToBeCodeChange,
    handlePptNoChange,
    templateId,
  } = useTemplate();

  // HTML 파일 업로드 훅
  const {
    backupHtmlFile,
    backupHtmlContent,
    htmlUploadStatus,
    handleBackupHtmlFileUpload,
    countOccurrences,
  } = useFileUpload();
  
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
    backupHtmlFile,
    backupHtmlContent,
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
        handleGetTemplate={handleGetTemplate}
        showGetTemplateButton={false}
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

      <button
        className="flex justify-center items-center bg-[#FF782F] text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[175px]"
        onClick={handleGetTemplate}
      >
        템플릿 불러오기
      </button>
      <Gap gap={50} />

      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <FileUploadSection
        fileName={backupHtmlFile?.name ?? ""}
        htmlUploadStatus={htmlUploadStatus}
        handleBackupHtmlFileUpload={handleBackupHtmlFileUpload}
        countryCode={countryCode}
      />
      <FileConvert
        fileName={backupHtmlFile?.name ?? ""}
        isProcessing={isProcessing}
        isExecuted={isExecuted}
        uploadProgress={uploadProgress}
        uploadStatus={uploadStatus}
        downloadedFileName={downloadedFileName}
        handleConvertByCountryCode={handleConvertByCountryCode}
        handleDownload={handleDownload}
      />
      <Gap gap={50} />

      <TitleLabel text="✅ AS-WAS / TO-BE 확인하기" />
      <Gap gap={15} />
      <WhiteBox>
        <TableSection
          textareas={textareas}
          hasBackupHtmlFile={!!backupHtmlFile}
          handleAsWasCodeChange={handleAsWasCodeChange}
          handleToBeCodeChange={handleToBeCodeChange}
          handlePptNoChange={handlePptNoChange}
          countOccurrences={countOccurrences}
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
