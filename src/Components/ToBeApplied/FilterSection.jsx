import CustomDropdownInput from "@Components/Common/CustomDropdownInput";
import styled from "styled-components";

const FilterSection = ({ filter, setFilter, filterTobe, setFilterTobe }) => {
  const handleFilterChange = (value) => {
    setFilter(
      value === "선택된 항목"
        ? "checked"
        : value === "선택되지 않은 항목"
        ? "unchecked"
        : "all"
    );
  };

  const handleFilterTobeChange = (value) => {
    setFilterTobe(
      value === "To-Be 적용" ? "yes" : value === "To-Be 미적용" ? "no" : "all"
    );
  };

  return (
    <TitleRow>
      <Title>👀 AS-WAS / TO BE / Localization 확인하기</Title>
      <DropdownGroup>
        <CustomDropdownInput
          value={
            filter === "all"
              ? "전체 항목"
              : filter === "checked"
              ? "선택된 항목"
              : "선택되지 않은 항목"
          }
          onChange={handleFilterChange}
          placeholder="항목 선택"
          options={["전체 항목", "선택된 항목", "선택되지 않은 항목"]}
        />
        <CustomDropdownInput
          value={
            filterTobe === "all"
              ? "전체 항목"
              : filterTobe === "yes"
              ? "To-Be 적용"
              : "To-Be 미적용"
          }
          onChange={handleFilterTobeChange}
          placeholder="To-Be 선택"
          options={["전체 항목", "To-Be 적용", "To-Be 미적용"]}
        />
      </DropdownGroup>
    </TitleRow>
  );
};

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Title = styled.h2`
  font-size: 1rem;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
  margin-bottom: 20px;
`;

const DropdownGroup = styled.div`
  display: flex;
  justify-content: end;
  gap: 16px;
  padding-bottom: 16px;
`;

export default FilterSection;
