import SearchTemplate from "@ApplyTemplate/SearchTemplate";
import FileConvert from "@ApplyTemplate/FileConvert";
import TableSection from "@/Components/ApplyTemplate/TableSection";
import styled from "styled-components";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";
import { useSearchTemplate } from "@/hooks/SearchTemplate/useSearchTemplate";

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
      <SearchTemplate
        ticketNum={ticketNum}
        ticketUrl={ticketUrl}
        setTicketNum={setTicketNum}
        setTicketUrl={setTicketUrl}
        countryCode={countryCode}
        handleSearchTemplate={handleSearchTemplate}
        handleCountryChange={handleCountryChange}
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

      <TitleLabel text="👀 AS-WAS / TO-BE / Localization 확인하기" />
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
