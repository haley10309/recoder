import { useState } from "react";
import SearchTemplate from "@ApplyTemplate/SearchTemplate";
import FileConvert from "@ApplyTemplate/FileConvert";
import FilterSection from "@/Components/ApplyTemplate/FilterSection";
import TableSection from "@/Components/ApplyTemplate/TableSection";
import styled from "styled-components";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";
import { useSearchTemplate } from "@/hooks/SearchTemplate/useSearchTemplate";

const ApplyTemplate = () => {
  const {
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    isEnglishCountry,
    setIsEnglishCountry,
    textareas,
    setTextareas,
    // checkForExistingTemplate,
  } = useSearchTemplate();

  const [codeChanges, setCodeChanges] = useState([]);
  const [countryCode, setCountryCode] = useState("");
  const [filter, setFilter] = useState("");
  const [filterTobe, setFilterTobe] = useState("");

  const handleAsWasCodeChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, asWasCode: value } : textarea
    );
    setTextareas(newTextareas);
  };

  const handleToBeCodeChange = (index, value) => {
    const newTextareas = textareas.map((textarea, i) =>
      i === index ? { ...textarea, toBeCode: value } : textarea
    );
    setTextareas(newTextareas);
  };

  const handleCheckedChange = (index) => {
    const newTextareas = [...textareas];
    newTextareas[index] = {
      ...newTextareas[index],
      checked: !newTextareas[index].checked,
    };
    setTextareas(newTextareas);
  };

  const filterTextareas = () => {
    let filtered = textareas.slice(0);

    if (filter === "checked") {
      filtered = filtered.filter((textarea) => textarea.checked);
    } else if (filter === "unchecked") {
      filtered = filtered.filter((textarea) => !textarea.checked);
    }

    if (filterTobe === "yes") {
      filtered = filtered.filter((textarea) => textarea.isApplied === "yes");
    } else if (filterTobe === "no") {
      filtered = filtered.filter((textarea) => textarea.isApplied === "no");
    }

    return filtered;
  };

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <TitleLabel text="📄 템플릿 불러오기" />
      <Gap gap={15} />
      <SearchTemplate
        setTextareas={setTextareas}
        setCodeChanges={setCodeChanges}
        ticketNum={ticketNum}
        ticketUrl={ticketUrl}
        setTicketNum={setTicketNum}
        setTicketUrl={setTicketUrl}
        countryCode={countryCode}
        setCountryCode={setCountryCode}
        setIsEnglishCountry={setIsEnglishCountry}
        // onClick={() => checkForExistingTemplate('search-template')}
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
