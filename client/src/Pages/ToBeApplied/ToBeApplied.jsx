import { useState } from "react";
import SearchTemplate from "@ToBeApplied/SearchTemplate";
import FileConvert from "@ToBeApplied/FileConvert";
import FilterSection from "@/Components/ToBeApplied/FilterSection";
import TableSection from "@/Components/ToBeApplied/TableSection";
import styled from "styled-components";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";
import { useSearchTemplate } from "@/hooks/SearchTemplate/useSearchTemplate";

const ToBeApplied = () => {
  const {
    ticketNum,
    setTicketNum,
    ticketUrl,
    setTicketUrl,
    isEnglishCountry,
    setIsEnglishCountry,
    textareas,
    setTextareas,
    checkForExistingTemplate,
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

  const filteredTextareas = () => {
    let filtered = textareas;

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
      <TitleLabel text="🧾 핫픽스/로컬라이제이션 템플릿 불러오기 // TODO: 핫픽스 문구 수정하기" />
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
        isEnglishCountry={isEnglishCountry}
      />
      <Gap gap={50} />

      <TitleLabel text="👀 AS-WAS / TO BE / Localization 확인하기" />
      <Gap gap={15} />
      <WhiteBox>
        <FilterSection
          filter={filter}
          setFilter={setFilter}
          filterTobe={filterTobe}
          setFilterTobe={setFilterTobe}
        />
        <TableSection
          filteredTextareas={filteredTextareas}
          codeChanges={codeChanges}
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

export default ToBeApplied;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
  margin-top: 2rem;
`;
