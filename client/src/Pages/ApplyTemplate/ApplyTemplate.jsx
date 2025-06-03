import SiteCode from "@/Pages/ApplyTemplate/SiteCode";
import FileConvert from "@ApplyTemplate/FileConvert";
import TableSection from "@/Components/ApplyTemplate/TableSection";
import styled from "styled-components";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";
import { useSearchTemplate } from "@/hooks/ApplyTemplate/useSearchTemplate";
import CheckTemplate from "@/Components/CheckTemplate/CheckTemplate";

const ApplyTemplate = () => {
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

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <TitleLabel text="📄 템플릿 불러오기" />
      <Gap gap={15} />
      <CheckTemplate
        ticketNum={ticketNum}
        ticketUrl={ticketUrl}
        setTicketNum={setTicketNum}
        setTicketUrl={setTicketUrl}
        onClick={() => handleSearchTemplate()}
      />
      <Gap gap={50} />

      <TitleLabel text="🗺️ 국가코드 선택" />
      <Gap gap={15} />
      <SiteCode
        countryCode={countryCode}
        handleCountryChange={handleCountryChange}
        isEnglishCountry={isEnglishCountry}
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
        />
      </WhiteBox>
      <Gap gap={50} />
    </div>
  );
};

export default ApplyTemplate;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
`;
