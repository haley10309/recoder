import React from "react";
import styled from "styled-components";

// 검사된 블록(= xlsx의 각 data-copy-set row) 중 번역이 정상 반영된 것과
// 매칭 실패한 것의 현황을 요약해서 보여준다.
const CopyDeckCoverage = ({ blocks, verifyStatus }) => {
  if (verifyStatus !== "success") return null;
  if (!blocks || blocks.length === 0) return null;

  const total = blocks.length;
  const matchedBlocks = blocks.filter((b) => b.matched);
  const failedBlocks = blocks.filter((b) => !b.matched);
  const matchedCount = matchedBlocks.length;

  return (
    <CoverageBox>
      <Summary>
        📋 카피덱 사용 현황 — 전체 {total}개 중{" "}
        <strong>{matchedCount}개 적용됨</strong>
        {failedBlocks.length > 0 && (
          <UnusedCount> / {failedBlocks.length}개 매칭 실패</UnusedCount>
        )}
      </Summary>

      {failedBlocks.length > 0 && (
        <UnusedList>
          {failedBlocks.map((block, idx) => (
            <UnusedItem key={idx}>
              <span className="cs" title={block.copySetNumber}>
                [{block.copySetNumber}]
              </span>
              <span className="en" title={block.original_copy}>
                {block.original_copy}
              </span>
              <span className="arrow">→</span>
              <span className="tr" title={String(block.expected_copy)}>
                {String(block.expected_copy)}
              </span>
            </UnusedItem>
          ))}
        </UnusedList>
      )}
    </CoverageBox>
  );
};

export default CopyDeckCoverage;

const CoverageBox = styled.div`
  background: #f9f9f9;
  border-radius: 0.625rem;
  padding: 1rem 1.25rem;
`;

const Summary = styled.div`
  font-size: 13px;
  color: #32383e;
`;

const UnusedCount = styled.span`
  color: #ffa600;
  font-weight: 700;
`;

const UnusedList = styled.div`
  margin-top: 0.75rem;
  max-height: 220px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
`;

const UnusedItem = styled.div`
  display: flex;
  gap: 0.5rem;
  font-size: 12px;
  padding: 4px 0;
  border-bottom: 1px dashed #eee;

  &:last-child {
    border-bottom: none;
  }

  .cs {
    flex-shrink: 0;
    color: #b45309;
    font-weight: 700;
  }

  .en {
    flex: 1;
    min-width: 0;
    color: #b91c1c;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .arrow {
    color: #9ca3af;
  }

  .tr {
    flex: 1;
    min-width: 0;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;
