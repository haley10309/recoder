import React from "react";
import styled from "styled-components";

import CopyTextButton from "@/Components/Common/CopyTextButton";

// 매칭된(또는 기대되는) 카피를 코드 블록 안에서 빨간색으로 하이라이트해서 보여준다.
const escapeHtml = (str) =>
  (str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const buildHighlightedHtml = (text, highlights) => {
  let html = escapeHtml(text ?? "");
  highlights.forEach((highlight) => {
    if (!highlight) return;
    const escapedHighlight = escapeHtml(highlight);
    const splited = html.split(escapedHighlight);
    if (splited.length >= 2) {
      html = splited.join(`<span class="text-red-500">${escapedHighlight}</span>`);
    }
  });
  return html;
};

const TranslationQaResultRow = ({ block, indexText }) => {
  const matched = block.matched;

  return (
    <Container>
      <div style={{ fontSize: "12px", paddingLeft: "15px", paddingTop: "10px" }}>
        {indexText}
      </div>
      <Wrapper>
        {/* 매칭 결과 */}
        <MatchBox>
          <TextBold>[{block.copySetNumber}]</TextBold>
          <ApplyTypeTag>{block.apply_type}</ApplyTypeTag>

          {matched ? (
            <MatchList>
              <MatchListTitle>English Copy 매칭 결과</MatchListTitle>
              <MatchItem $matched={true}>
                <div className="original" title={block.original_copy}>
                  {block.original_copy}
                </div>
                <div className="translated" title={block.expected_copy}>
                  → {block.expected_copy}
                </div>
              </MatchItem>
            </MatchList>
          ) : (
            <>
              <FailBadge>🚫 매칭 실패</FailBadge>
              <MatchList>
                <MatchListTitle>English Copy 매칭 결과</MatchListTitle>
                <MatchItem $matched={false}>
                  <div className="original" title={block.original_copy}>
                    {block.original_copy}
                  </div>
                  <FailTag>매칭 실패</FailTag>
                </MatchItem>
              </MatchList>
            </>
          )}
        </MatchBox>

        {/* BEFORE (원문 하이라이트) */}
        <CodeBlock>
          <CodeLabel>BEFORE</CodeLabel>
          <ReadOnlyBox
            dangerouslySetInnerHTML={{
              __html: buildHighlightedHtml(block.beforeCode, [block.original_copy]),
            }}
          />
          <CopyTextButton text={"코드 복사"} value={block.beforeCode} />
        </CodeBlock>

        {/* AFTER (기대 번역 하이라이트) */}
        <CodeBlock>
          <CodeLabel>AFTER</CodeLabel>
          <ReadOnlyBox
            dangerouslySetInnerHTML={{
              __html: buildHighlightedHtml(block.afterCode, [block.expected_copy]),
            }}
          />
          <CopyTextButton text={"코드 복사"} value={block.afterCode} />
        </CodeBlock>

        {/* 검사 결과 */}
        <CodeBlock>
          <CodeLabel>검사 결과</CodeLabel>
          <ResultBox $matched={matched}>
            <ResultText $matched={matched}>{block.resultText}</ResultText>
            {!matched && block.failReason && (
              <FailReason>🚨 {block.failReason}</FailReason>
            )}
            {!matched && block.originalStillPresent && block.correctAnswer && (
              <CorrectAnswerBox>
                <CorrectAnswerTitle>✅ 이 자리에 들어가야 할 정답 번역</CorrectAnswerTitle>
                <CorrectAnswerText>{block.correctAnswer}</CorrectAnswerText>
              </CorrectAnswerBox>
            )}
          </ResultBox>
        </CodeBlock>
      </Wrapper>
    </Container>
  );
};

export default TranslationQaResultRow;

const Container = styled.div`
  margin-bottom: 1rem;
  background-color: #f6f6f6;
`;

const Wrapper = styled.div`
  display: flex;
  padding: 1rem;
  border-bottom: 1px solid #d1d5db;
  align-items: flex-start;
  gap: 1rem;
`;

const MatchBox = styled.div`
  width: 16%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  color: #111827;
`;

const TextBold = styled.span`
  font-weight: bold;
`;

const ApplyTypeTag = styled.span`
  display: inline-block;
  align-self: flex-start;
  font-size: 10px;
  font-weight: 700;
  color: #374151;
  background: #e5e7eb;
  border-radius: 4px;
  padding: 1px 6px;
`;

const FailBadge = styled.div`
  font-size: 11px;
  color: #ffa600;
  font-weight: 700;
`;

const MatchList = styled.div`
  width: 100%;
  max-height: 220px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 6px;
`;

const MatchListTitle = styled.div`
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const MatchItem = styled.div`
  font-size: 11px;
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px dashed #eee;

  &:last-child {
    border-bottom: none;
  }

  .original {
    color: ${({ $matched }) => ($matched ? "#111827" : "#b91c1c")};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .translated {
    color: #2a9d8f;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const FailTag = styled.span`
  display: inline-block;
  margin-top: 2px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: #ef4444;
  border-radius: 4px;
  padding: 1px 6px;
`;

const CodeBlock = styled.div`
  width: 28%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CodeLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #4b5563;
`;

const ReadOnlyBox = styled.pre`
  width: 100%;
  height: 180px;
  margin: 0;
  background-color: #e4e4e4;
  border-radius: 5px;
  font-size: 13px;
  font-weight: 500;
  white-space: pre-wrap;
  word-break: break-all;
  overflow: auto;
  outline: none;
  border: 1px solid #ccc;
  padding: 8px;
`;

const ResultBox = styled.div`
  width: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: ${({ $matched }) => ($matched ? "#ecfdf3" : "#fff7ed")};
  border: ${({ $matched }) =>
    $matched ? "1px solid #86efac" : "2px solid #ffa600"};
`;

const ResultText = styled.div`
  font-size: 14px;
  font-weight: 700;
  word-break: break-all;
  color: ${({ $matched }) => ($matched ? "#15803d" : "#b45309")};
`;

const FailReason = styled.div`
  font-size: 12px;
  color: #b45309;
`;

const CorrectAnswerBox = styled.div`
  margin-top: auto;
  padding: 0.6rem 0.75rem;
  background: #fff;
  border: 1px solid #86efac;
  border-radius: 6px;
`;

const CorrectAnswerTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: #15803d;
  margin-bottom: 4px;
`;

const CorrectAnswerText = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #15803d;
  word-break: break-all;
`;
