import SiteCode from "@/Pages/TemplateMapping/SiteCode";
import FileConvert from "@/Pages/TemplateMapping/FileConvert";
import TableSection from "@/Components/TemplateMapping/TableSection";
import styled from "styled-components";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";
import { useSearchTemplate } from "@/hooks/TemplateMapping/useSearchTemplate";
import { useFileUpload } from "@/hooks/TemplateMapping/useFileUpload";
import AddIcon from "@mui/icons-material/Add";
import { useTranslationUpload } from "@/hooks/TemplateMapping/useTranslationUpload";
import CheckTemplate from "@/Components/TemplateMapping/CheckTemplate";

const TemplateMapping = () => {
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

      {/* <div className="flex gap-[15px] save_button_div">
        <button onClick={addTextArea} className="plus-button rounded-[10px]">
          <AddIcon />
          <span className="ml-2">항목 추가</span>
        </button>
        <button type="button" className="save_button" onClick={handleSaveTemplate}>
          {` 템플릿 저장`}
        </button>
      </div> */}
    </div>
  );
};

export default TemplateMapping;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
`;
