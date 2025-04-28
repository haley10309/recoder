import BasicTextarea from "@/Components/ToBeApplied/Textarea";
import styled from "styled-components";
import { useRecoilValue } from "recoil";
import { isEnglishCountryState } from "@/recoil/atoms/state";

const TableSection = ({
  filteredTextareas,
  codePairs,
  country_code,
  handleAsWasCodeChange,
  handleToBeCodeChange,
  handleCheckedChange,
  filter,
  filterTobe,
}) => {
  const isEnglishCountry = useRecoilValue(isEnglishCountryState);

  return (
    <TableWrapper>
      <TableHeader>
        <HeaderCell width={isEnglishCountry ? "5%" : "5%"}>항목</HeaderCell>
        <HeaderCell width={isEnglishCountry ? "15%" : "10%"}>
          PPT NO.
        </HeaderCell>
        <HeaderCell width={isEnglishCountry ? "40%" : "25%"}>
          As-Was Code
        </HeaderCell>
        <HeaderCell width={isEnglishCountry ? "40%" : "25%"}>
          To-Be Code
        </HeaderCell>
        {!isEnglishCountry && (
          <HeaderCell width="25%">로컬라이제이션</HeaderCell>
        )}
        <HeaderCell width={isEnglishCountry ? "10%" : "10%"}>
          작업 완료 여부
        </HeaderCell>
      </TableHeader>

      {filteredTextareas().map((textarea, index) => (
        <BasicTextarea
          key={index}
          pptNo={textarea.pptNo} // ✅ 바로 사용
          asWasCode={textarea.asWasCode.replace(
            /\/site\//g,
            `/${country_code}/`
          )}
          setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
          toBeCode={textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`)}
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
          country_code={country_code}
          matchedPart={textarea.matchedPart}
          asWasOccurrenceCount={textarea.asWasOccurrenceCount}
          toBeOccurrenceCount={textarea.toBeOccurrenceCount}
          errorState={textarea.errorState}
        />
      ))}
    </TableWrapper>
  );
};

const TableWrapper = styled.div`
  background-color: #f6f6f6;
  margin-bottom: 80px;
  width: 100%;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background-color: white;
  border: 1px solid #d1d5db;
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
