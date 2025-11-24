import React from "react";
import styled from "styled-components";

import BasicTextarea from "./BasicTextarea";

const TableSection = ({
  textareas,
  countryCode,
  handleToBeCodeChange,
  handleLocalizedToBeCodeChange,
  isEnglishCountry,
  hasOriginalFile,
  countOccurrences,
  englishCopyList,
}) => {
  return (
    <TableWrapper>
      <TableHeader>
        <HeaderCell width={isEnglishCountry === false ? "13%" : "10%"}>
          LocalizationEntry Id
        </HeaderCell>
        <HeaderCell width={"40%"}>
          TO-BE Code
        </HeaderCell>
        <HeaderCell width={"40%"}>Localized TO-BE</HeaderCell>
      </TableHeader>

      {textareas.map((textarea, index) => (
        <BasicTextarea
          key={`apply-translation-${index}`}
          indexText={`${index + 1} of ${textareas.length}`}
          localizationEntryId={textarea.localizationEntryId}
          toBeCode={textarea.toBeCode}
          setToBeCode={(value) => handleToBeCodeChange(index, value)}
          localizedToBeCode={textarea.localizedToBeCode}
          setLocalizedToBeCode={(value) =>
            handleLocalizedToBeCodeChange(index, value)
          }
          countryCode={countryCode}
          matchedPart={textarea.matchedPart}
          asWasOccurrenceCount={textarea.asWasOccurrenceCount}
          toBeOccurrenceCount={textarea.toBeOccurrenceCount}
          errorState={textarea.errorState}
          hasOriginalFile={hasOriginalFile}
          countOccurrencesResult_tobe={countOccurrences(textarea.toBeCode)}
          highlights={englishCopyList}
        />
      ))}
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
