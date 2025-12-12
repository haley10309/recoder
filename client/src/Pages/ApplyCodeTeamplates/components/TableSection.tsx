import styled from "styled-components";

import BasicTextarea from "./BasicTextarea";

const TableSection = ({
  textareas,
  hasBackupHtmlFile,
  handleAsWasCodeChange,
  handleToBeCodeChange,
  handlePptNoChange,
  countOccurrences,
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

      {textareas.map((textarea, index) => {
        return (
          <BasicTextarea
            key={index}
            indexText={`${index + 1} of ${textareas.length} / id: ${textarea.id ? textarea.id : "DB 저장 전"}`}
            pptNo={textarea.pptNo}
            asWasCode={textarea.asWasCode}
            setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
            toBeCode={textarea.toBeCode}
            setToBeCode={(value) => handleToBeCodeChange(index, value)}
            isApplied={textarea.isApplied}
            matchedPart={textarea.matchedPart}
            errorState={textarea.errorState}
            hasBackupHtmlFile={hasBackupHtmlFile}
            handlePptNoChange={(value) => handlePptNoChange(index, value)}
            countOccurrences={countOccurrences}
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
