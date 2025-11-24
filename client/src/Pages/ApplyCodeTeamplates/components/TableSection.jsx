import styled from "styled-components";

import BasicTextarea from "./BasicTextarea";

const TableSection = ({
  filteredTextareas,
  countryCode,
  handleAsWasCodeChange,
  handleToBeCodeChange,
  filter,
  isEnglishCountry,
  hasOriginalFile,
  handleNonAssetPptNoChange,
}) => {
  return (
    <TableWrapper>
      <TableHeader>
        <HeaderCell width={"10%"}>
          PPT NO.
        </HeaderCell>
        <HeaderCell width={"45%"}>
          AS-WAS Code
        </HeaderCell>
        <HeaderCell width={"40%"}>
          TO-BE Code
        </HeaderCell>
      </TableHeader>

      {filteredTextareas.map((textarea, index) => {
        const lowerCaseCountryCode = countryCode?.toLowerCase?.() || "";
        return (
          <BasicTextarea
            key={index}
            indexText={`${index + 1} of ${filteredTextareas.length} / id: ${textarea.id ? textarea.id : "DB 저장 전"}`}
            pptNo={textarea.pptNo} // ✅ 바로 사용
            asWasCode={textarea.asWasCode.replace(
              /\/uk\//g,
              `/${lowerCaseCountryCode}/`
            )}
            setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
            toBeCode={textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCountryCode}/`)}
            setToBeCode={(value) => handleToBeCodeChange(index, value)}
            isApplied={textarea.isApplied}
            countryCode={countryCode}
            matchedPart={textarea.matchedPart}
            asWasOccurrenceCount={textarea.asWasOccurrenceCount}
            toBeOccurrenceCount={textarea.toBeOccurrenceCount}
            errorState={textarea.errorState}
            isEnglishCountry={isEnglishCountry}
            hasOriginalFile={hasOriginalFile}
            handleNonAssetPptNoChange={(value) => handleNonAssetPptNoChange(index, value)}
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
