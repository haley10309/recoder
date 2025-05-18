import { useState } from "react";
import { useRecoilState } from "recoil";
import { textareasState } from "@/recoil/atoms/state";
import SearchTemplate from "@ToBeApplied/SearchTemplate";
import FileConvert from "@ToBeApplied/FileConvert";
import FilterSection from "@/Components/ToBeApplied/FilterSection";
import TableSection from "@/Components/ToBeApplied/TableSection";
import { countryCodeState } from "@/recoil/atoms/state";
import styled from "styled-components";

const ToBeApplied = () => {
  const [textareas, setTextareas] = useRecoilState(textareasState);
  const [codePairs, setCodePairs] = useState([]);
  const [country_code, setCountry_code] = useRecoilState(countryCodeState);
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
      {/* 🧾 핫픽스/로컬라이제이션 템플릿 불러오기 // TODO: 핫픽스 문구 수정하기 */}
      <SearchTemplate setTextareas={setTextareas} setCodePairs={setCodePairs} />

      {/* 📤 파일 업로드 */}
      <FileConvert textareas={textareas} setTextareas={setTextareas} />

      {/* 👀 AS-WAS / TO BE / Localization 확인하기 */}
      <WhiteBox>
        <FilterSection
          filter={filter}
          setFilter={setFilter}
          filterTobe={filterTobe}
          setFilterTobe={setFilterTobe}
        />
        <TableSection
          filteredTextareas={filteredTextareas}
          codePairs={codePairs}
          country_code={country_code}
          handleAsWasCodeChange={handleAsWasCodeChange}
          handleToBeCodeChange={handleToBeCodeChange}
          handleCheckedChange={handleCheckedChange}
          filter={filter}
          filterTobe={filterTobe}
        />
      </WhiteBox>
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
