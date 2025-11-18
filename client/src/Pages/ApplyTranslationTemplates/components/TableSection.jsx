import React from "react";
import styled from "styled-components";

import BasicTextarea from "./BasicTextarea";

const TableSection = ({
  filteredTextareas,
  countryCode,
  handleAsWasCodeChange,
  handleToBeCodeChange,
  handleCheckedChange,
  filter,
  filterTobe,
  isEnglishCountry,
  hasOriginalFile,
  countOccurrences,
}) => {
  return (
    <TableWrapper>
      <TableHeader>
        {/* <HeaderCell width={"5%"}>항목</HeaderCell> */}
        <HeaderCell width={isEnglishCountry === false ? "13%" : "10%"}>
          PPT NO.
        </HeaderCell>
        <HeaderCell width={isEnglishCountry === false ? "25%" : "45%"}>
          AS-WAS Code
        </HeaderCell>
        <HeaderCell width={isEnglishCountry === false ? "27%" : "40%"}>
          TO-BE Code
        </HeaderCell>
        {isEnglishCountry === false && (
          <HeaderCell width="28%">Localized TO-BE</HeaderCell>
        )}
      </TableHeader>

      {filteredTextareas.map((textarea, index) => {
        const asWasCode = textarea.asWasCode;
        const toBeCode = textarea.toBeCode;
        return (
          <BasicTextarea
            key={index}
            indexText={`${index + 1} of ${filteredTextareas.length}`}
            pptNo={textarea.pptNo} // ✅ 바로 사용
            asWasCode={asWasCode}
            setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
            toBeCode={toBeCode}
            setToBeCode={(value) => handleToBeCodeChange(index, value)}
            localizedToBeCode={textarea.localizedToBeCode}
            setLocalizedToBeCode={(value) =>
              handleToBeCodeChange(index, value, { isLocalized: true })
            }
            changed={{ index, changed: textarea.changed }}
            isApplied={textarea.isApplied}
            onCheckedChange={() => handleCheckedChange(index)}
            checked={textarea.checked}
            filter={filter}
            filterTobe={filterTobe}
            countryCode={countryCode}
            matchedPart={textarea.matchedPart}
            asWasOccurrenceCount={textarea.asWasOccurrenceCount}
            toBeOccurrenceCount={textarea.toBeOccurrenceCount}
            errorState={textarea.errorState}
            isEnglishCountry={isEnglishCountry}
            hasOriginalFile={hasOriginalFile}
            countOccurrencesResult_tobe={countOccurrences(toBeCode)}
          />
        );
      })}
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  width: 100%;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border: 1px solid #cfcfcf;
  border-radius: 0.625rem 0.625rem 0 0;
`;

const HeaderCell = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 500;
  width: ${({ width }) => width};
`;

export default TableSection;
