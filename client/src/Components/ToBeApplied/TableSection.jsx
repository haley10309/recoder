import BasicTextarea from "@/Components/ToBeApplied/Textarea";
import styled from "styled-components";

const TableSection = ({
  filteredTextareas,
  codeChanges,
  countryCode,
  handleAsWasCodeChange,
  handleToBeCodeChange,
  handleCheckedChange,
  filter,
  filterTobe,
  isEnglishCountry,
}) => {
  return (
    <TableWrapper>
      <TableHeader>
        <HeaderCell width={isEnglishCountry ? "5%" : "5%"}>항목</HeaderCell>
        <HeaderCell width={isEnglishCountry ? "10%" : "13%"}>
          PPT NO.
        </HeaderCell>
        <HeaderCell width={isEnglishCountry ? "45%" : "25%"}>
          As-Was Code
        </HeaderCell>
        <HeaderCell width={isEnglishCountry ? "40%" : "27%"}>
          To-Be Code
        </HeaderCell>
        {!isEnglishCountry && (
          <HeaderCell width="28%">로컬라이제이션</HeaderCell>
        )}
        {/* <HeaderCell width={isEnglishCountry ? "10%" : "10%"}>
          작업 완료 여부
        </HeaderCell> */}
      </TableHeader>

      {filteredTextareas().map((textarea, index) => (
        <BasicTextarea
          key={index}
          pptNo={textarea.pptNo} // ✅ 바로 사용
          asWasCode={textarea.asWasCode.replace(
            /\/uk\//g,
            `/${countryCode}/`
          )}
          setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
          toBeCode={textarea.toBeCode.replace(/\/uk\//g, `/${countryCode}/`)}
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
        />
      ))}
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  margin-bottom: 80px;
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
