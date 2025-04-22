import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Yes from "@/assets/tobe_yes.png";
import No from "@/assets/tobe_no.png";
import Copy from "@/assets/copy.png";

const BasicTextarea = ({
  pptNo,
  asWasCode,
  setAsWasCode,
  toBeCode,
  setToBeCode,
  localizedToBeCode,
  setLocalizedToBeCode,
  isApplied,
  checked,
  onCheckedChange,
  filter,
  country_code,
  matchedPart,
  asWasOccurrenceCount,
  toBeOccurrenceCount,
}) => {
  const isCheckboxDisabled = filter === "checked" || filter === "unchecked";

  const transformedAsWasCode = asWasCode?.replace(
    /\/site\//g,
    `/${country_code}/`
  );

  const [isMatchedPartVisible, setIsMatchedPartVisible] = useState(false);

  const handleToggleMatchedPart = () => {
    setIsMatchedPartVisible((prev) => !prev);
  };

  const handleCopyClipBoard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      alert("failed");
    }
  };

  return (
    <Container>
      <Wrapper>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            checked={checked}
            onChange={onCheckedChange}
            disabled={isCheckboxDisabled}
          />
        </CheckboxWrapper>

        <PptNo>
          <TextBold>p. {pptNo}</TextBold>
        </PptNo>

        {/* AS-WAS */}
        <CodeBlock>
          <Textarea
            value={transformedAsWasCode}
            onChange={(e) => setAsWasCode(e.target.value)}
            placeholder="As-Was code를 입력하세요."
          />
          <OccurrenceCount>
            <strong>[AS-WAS] 일치하는 코드 출현 횟수:</strong>{" "}
            {asWasOccurrenceCount > 0 ? `${asWasOccurrenceCount}회` : "없음"}
          </OccurrenceCount>

          {matchedPart && (
            <MatchedPartWrapper>
              <ToggleButton onClick={handleToggleMatchedPart}>
                {isMatchedPartVisible ? "코드 숨기기" : "일치하는 코드 보기"}
              </ToggleButton>

              {isMatchedPartVisible && (
                <MatchedPartContainer>
                  <strong>Front Matched Part:</strong>
                  <Pre>{matchedPart[0]}</Pre>
                  <CopyButton
                    onClick={() => handleCopyClipBoard(matchedPart[0])}
                  >
                    <CopyIcon src={Copy} alt="copy" />
                  </CopyButton>
                  <strong>Back Matched Part:</strong>
                  <Pre>{matchedPart[1]}</Pre>
                  <CopyButton
                    onClick={() => handleCopyClipBoard(matchedPart[1])}
                  >
                    <CopyIcon src={Copy} alt="copy" />
                  </CopyButton>
                </MatchedPartContainer>
              )}
            </MatchedPartWrapper>
          )}
        </CodeBlock>

        {/* TO-BE */}
        <CodeBlock>
          <Textarea
            value={toBeCode}
            onChange={(e) => setToBeCode(e.target.value)}
            placeholder="To-Be code를 입력하세요."
            $isApplied={isApplied}
          />
        </CodeBlock>

        {/* LOCALIZED TO-BE */}
        <CodeBlock>
          <Textarea
            value={localizedToBeCode}
            onChange={(e) => setLocalizedToBeCode(e.target.value)}
            placeholder="로컬라이제이션을 적용하세요."
          />
        </CodeBlock>

        {/* 결과 표시 */}
        <ToBeAppliedWrapper>
          {isApplied === "yes" ? (
            <YesIcon src={Yes} alt="yes" />
          ) : (
            <NoIcon src={No} alt="no" />
          )}
        </ToBeAppliedWrapper>
      </Wrapper>
    </Container>
  );
};

export default BasicTextarea;

const Container = styled.div`
  margin-bottom: 1rem;
`;

const Wrapper = styled.div`
  display: flex;
  padding: 1rem;
  background-color: #f6f6f6;
  border-bottom: 1px solid #d1d5db;
  align-items: flex-start;
  gap: 1rem;
`;

const CheckboxWrapper = styled.div`
  width: 5%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Checkbox = styled.input`
  width: 24px;
  height: 24px;
`;

const PptNo = styled.div`
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #111827;
`;

const TextBold = styled.span`
  font-weight: bold;
`;

const CodeBlock = styled.div`
  width: 25%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 150px;
  background-color: #d9d9d9;
  resize: none;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;

  /* 조건에 따른 테두리 색상 */
  ${({ $isApplied }) =>
    $isApplied === "yes"
      ? `border: 2px solid green;`
      : $isApplied === "no"
      ? `border: 2px solid red;`
      : ``}

  overflow: hidden;

  &:hover,
  &:focus {
    overflow: auto;
  }

  scrollbar-width: thin;
  scrollbar-color: #8a8a8a #e5e7eb;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e5e7eb;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #e5e7eb;
    border-radius: 10px;
  }
`;

const OccurrenceCount = styled.div`
  font-size: 12px;
  color: #4b5563;
`;

const MatchedPartWrapper = styled.div``;

const ToggleButton = styled.button`
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #f3f4f6;
  cursor: pointer;
`;

const MatchedPartContainer = styled.div`
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background-color: #f9fafb;
`;

const Pre = styled.pre`
  white-space: pre-wrap;
  background-color: #f3f4f6;
  padding: 0.5rem;
  border-radius: 6px;
`;

const CopyButton = styled.button`
  margin-top: 0.5rem;
  cursor: pointer;
`;

const CopyIcon = styled.img`
  width: 18px;
  height: 18px;
`;

const ToBeAppliedWrapper = styled.div`
  width: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const YesIcon = styled.img`
  width: 50px;
  height: 50px;
`;

const NoIcon = styled.img`
  width: 50px;
  height: 50px;
`;
