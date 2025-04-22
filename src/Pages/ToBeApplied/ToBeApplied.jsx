import { useState } from "react";
import { useRecoilState } from "recoil";
import { textareasState } from "@/recoil/atoms/state";
import SearchTemplate from "@ToBeApplied/SearchTemplate";
import FileConvert from "@ToBeApplied/FileConvert";
import FilterSection from "@/Components/ToBeApplied/FilterSection";
import TableSection from "@/Components/ToBeApplied/TableSection";
import styled from "styled-components";

const ToBeApplied = () => {
  const [textareas, setTextareas] = useRecoilState(textareasState);
  const [codePairs, setCodePairs] = useState([]);
  const [country_code, setCountry_code] = useState("");
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
    <Container>
      <SearchTemplate setTextareas={setTextareas} setCodePairs={setCodePairs} />
      <FileConvert textareas={textareas} setTextareas={setTextareas} />

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
    </Container>
  );
};

export default ToBeApplied;

const Container = styled.div`
  padding: 6.875rem;
  background-color: #ffffff;
  min-height: 100vh;
`;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
  margin-top: 2rem;
`;
