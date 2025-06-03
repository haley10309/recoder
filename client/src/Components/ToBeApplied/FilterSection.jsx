import React, { useState, useRef } from "react";
import styled from "styled-components";
import ArrowIcon from "@/assets/Path.svg";

const FilterSection = ({ filter, setFilter, filterTobe, setFilterTobe }) => {
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showTobeOptions, setShowTobeOptions] = useState(false);

  const filterOptions = [
    { label: "전체 항목", value: "all" },
    { label: "선택된 항목", value: "checked" },
    { label: "선택되지 않은 항목", value: "unchecked" },
  ];

  const filterTobeOptions = [
    { label: "전체 항목", value: "all" },
    { label: "TO-BE 적용", value: "yes" },
    { label: "TO-BE 미적용", value: "no" },
  ];

  const handleFilterSelect = (value) => {
    setFilter(value);
    setShowFilterOptions(false);
  };

  const handleTobeSelect = (value) => {
    setFilterTobe(value);
    setShowTobeOptions(false);
  };

  return (
    <TitleRow>
      <DropdownGroup>
        <DropdownContainer
          tabIndex={0}
          onBlur={() => setShowFilterOptions(false)}
        >
          <DropdownButton onClick={() => setShowFilterOptions((prev) => !prev)}>
            {filterOptions.find((opt) => opt.value === filter)?.label ||
              "전체 항목"}
            <Arrow src={ArrowIcon} $open={showFilterOptions} />
          </DropdownButton>
          {showFilterOptions && (
            <DropdownList>
              {filterOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  onMouseDown={() => handleFilterSelect(option.value)}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownList>
          )}
        </DropdownContainer>

        <DropdownContainer
          tabIndex={0}
          onBlur={() => setShowTobeOptions(false)}
        >
          <DropdownButton onClick={() => setShowTobeOptions((prev) => !prev)}>
            {filterTobeOptions.find((opt) => opt.value === filterTobe)?.label ||
              "전체 항목"}
            <Arrow src={ArrowIcon} $open={showTobeOptions} />
          </DropdownButton>
          {showTobeOptions && (
            <DropdownList>
              {filterTobeOptions.map((option) => (
                <DropdownItem
                  key={option.value}
                  onMouseDown={() => handleTobeSelect(option.value)}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </DropdownList>
          )}
        </DropdownContainer>
      </DropdownGroup>
    </TitleRow>
  );
};

export default FilterSection;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1rem;
  font-weight: 700;
`;

const DropdownGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const DropdownContainer = styled.div`
  position: relative;
  min-width: 11rem;
`;

const DropdownButton = styled.button`
  width: 100%;
  height: 2.625rem;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: #fff;
  border: 1px solid #ff782f;
  border-radius: 0.625rem;
  box-shadow: 0px 0px 10px 0px rgba(96, 130, 228, 0.25);
  text-align: left;
  cursor: pointer;
  position: relative;
`;

const Arrow = styled.img`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%)
    rotate(${(props) => (props.$open ? "180deg" : "0deg")});
  transition: transform 0.3s ease;
  width: 0.8rem;
  height: 0.8rem;
`;

const DropdownList = styled.ul`
  position: absolute;
  width: 100%;
  top: 110%;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 0.625rem;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  max-height: 10rem;
  overflow-y: auto;
`;

const DropdownItem = styled.li`
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  &:hover {
    background-color: #ffece1;
  }
`;
