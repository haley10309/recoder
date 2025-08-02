import SiteCode from "@/Pages/TemplateLocalization/SiteCode";
import FileConvert from "@/Pages/TemplateLocalization/FileConvert";
import TableSection from "@/Components/TemplateLocalization/TableSection";
import styled from "styled-components";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";
import { useSearchTemplate } from "@/hooks/TemplateLocalization/useSearchTemplate";
import CheckTemplate from "@/Components/CheckTemplate/CheckTemplate";
import { useFileUpload } from "@/hooks/TemplateLocalization/useFileUpload";

const TemplateLocalization = () => {
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
      <TitleLabel text="🗺️ 국가코드 선택" />
      <Gap gap={15} />
      <SiteCode
        countryCode={countryCode}
        handleCountryChange={handleCountryChange}
        isEnglishCountry={isEnglishCountry}
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

export default TemplateLocalization;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
`;
