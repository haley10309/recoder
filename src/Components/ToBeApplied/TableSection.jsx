// TableSection.js
import BasicTextarea from "@/Components/ToBeApplied/Textarea";
import styled from "styled-components";

const TableSection = ({ filteredTextareas, codePairs, country_code, handleAsWasCodeChange, handleToBeCodeChange, handleCheckedChange, filter, filterTobe }) => {
  return (
    <TableWrapper>
      <TableHeader>
        <HeaderCell width="5%">항목</HeaderCell>
        <HeaderCell width="10%">PPT NO.</HeaderCell>
        <HeaderCell width="25%">As-Was Code</HeaderCell>
        <HeaderCell width="25%">To-Be Code</HeaderCell>
        <HeaderCell width="25%">로컬라이제이션</HeaderCell>
        <HeaderCell width="10%">작업 완료 여부</HeaderCell>
      </TableHeader>

      {filteredTextareas().map((textarea, index) => {
        const matchedPptNo = codePairs.find((pair) => pair.aswas_code === textarea.asWasCode)?.ppt_no;

        return (
          <BasicTextarea
            key={index}
            pptNo={matchedPptNo}
            asWasCode={textarea.asWasCode.replace(
              /\/site\//g,
              `/${country_code}/`
            )}
            setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
            toBeCode={textarea.toBeCode.replace(
              /\/site\//g,
              `/${country_code}/`
            )}
            setToBeCode={(value) => handleToBeCodeChange(index, value)}
            changed={{ index, changed: textarea.changed }}
            isApplied={textarea.isApplied}
            onCheckedChange={() => handleCheckedChange(index)}
            checked={textarea.checked}
            filter={filter} // filter가 전달됨
            filterTobe={filterTobe} // filterTobe가 전달됨
            country_code={country_code}
            matchedPart={textarea.matchedPart}
            asWasOccurrenceCount={textarea.asWasOccurrenceCount}
            toBeOccurrenceCount={textarea.toBeOccurrenceCount}
          />
        );
      })}
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
