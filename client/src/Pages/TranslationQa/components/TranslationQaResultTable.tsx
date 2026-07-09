import React from "react";
import styled from "styled-components";

import TranslationQaResultRow from "./TranslationQaResultRow";

const TranslationQaResultTable = ({ blocks }) => {
  if (blocks.length === 0) {
    return (
      <EmptyState>
        검사를 실행하면 data-copy-set 별 검사 결과가 여기에 표시됩니다.
      </EmptyState>
    );
  }

  return (
    <TableWrapper>
      <TableHeader>
        <HeaderCell width={"16%"}>매칭 결과</HeaderCell>
        <HeaderCell width={"28%"}>BEFORE</HeaderCell>
        <HeaderCell width={"28%"}>AFTER</HeaderCell>
        <HeaderCell width={"28%"}>검사 결과</HeaderCell>
      </TableHeader>

      {blocks.map((block, i) => (
        <TranslationQaResultRow
          key={`qa-block-${block.index}`}
          block={block}
          indexText={`${i + 1} of ${blocks.length}`}
        />
      ))}
    </TableWrapper>
  );
};

export default TranslationQaResultTable;

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

const EmptyState = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  background: #f9f9f9;
  border-radius: 0.625rem;
  font-size: 13px;
`;
