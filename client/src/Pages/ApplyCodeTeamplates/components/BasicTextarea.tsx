import { useState } from "react";
import styled from "styled-components";

import Copy from "@/assets/copy.png";
import CopyTextButton from "@/Components/Common/CopyTextButton";

const BasicTextarea = ({
  indexText,
  pptNo,
  asWasCode,
  setAsWasCode,
  toBeCode,
  setToBeCode,
  isApplied,
  matchedPart,
  errorState,
  hasBackupHtmlFile,
  handlePptNoChange,
  countOccurrences,
}) => {
  const [isMatchedPartVisible, setIsMatchedPartVisible] = useState(false);

  const asWasOccurrenceCount = countOccurrences(asWasCode);

  const handleToggleMatchedPart = () => {
    setIsMatchedPartVisible((prev) => !prev);
  };

  const handleCopyClipBoard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      alert(err?.response?.data?.message || "failed");
    }
  };

  const getColor_toBe = () => {
    if (errorState) return "#ffa600";
    if (isApplied === "yes") {
      if (asWasOccurrenceCount === 1) return "blue";
      else return "orange";
    }
    if (isApplied === "no") return "red";
    if (isApplied === "sameAsBefore") return "rgb(156, 156, 156)";
    return "#d1d5db";
  };
  const color_toBe = getColor_toBe();

  return (
    <Container>
      <div style={{ fontSize: "12px", paddingLeft: "15px", paddingTop: "10px" }}>{indexText}</div>
      <Wrapper className="as_was_to_be_div flex items-start gap-[30px]">
        <PptNo className="flex flex-col justify-center items-center gap-[10px]">
          <div className="flex items-center gap-[10px]">
            <label className="font-[16px]">PPT NO.</label>
            <input
              type="text"
              className="w-[30px] h-[30px] rounded-[5px] text-center border border-[#8B8B8B] outline-none focus:border-[#595880]"
              value={pptNo}
              onChange={(e) => handlePptNoChange(e.target.value)}
            />
          </div>

          {!!pptNo && (
            <>
              <CopyTextButton
                text={"'ppt{숫자}'로 복사"}
                value={`ppt${pptNo ?? ''}`}
              />
              <CopyTextButton
                text={"'슬라이드 {숫자}'로 복사"}
                value={`슬라이드 ${pptNo ?? ''}`}
              />
            </>
          )}
        </PptNo>
        <div className="w-[100%] flex flex-col">
          <div className="w-[95%] flex gap-[20px] justify-center">
            {/* AS-WAS */}
            <CodeBlock>
              <Textarea
                value={asWasCode}
                onChange={(e) => setAsWasCode(e.target.value)}
                placeholder="AS-WAS 코드를 입력해 주세요."
              />

              <div className="flex font-bold">
                <div className="text-xs">
                  <span className="ml-1 text-[#4b5563;]">
                    [AS-WAS] 원본코드 내 AS-WAS 코드 출현 횟수:
                  </span>
                </div>
                {hasBackupHtmlFile ? (
                  <span className="ml-1 text-xs"
                    style={{
                      color: asWasOccurrenceCount === 1 
                              ? "blue" 
                              : asWasOccurrenceCount === 0
                                ? "red"
                                : "orange"
                    }}>
                      {`${asWasOccurrenceCount}회`}
                  </span>
                ) : (
                  <span className="ml-1 text-xs font-normal text-[#ff7300]">
                    (원본코드 업로드 필요)
                  </span>
                )}
              </div>
              
              <CopyTextButton
                text={"코드 복사"}
                value={asWasCode}
                style={{ marginTop: "10px" }}
              />

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
                placeholder="TO-BE 코드를 입력해 주세요."
                $isApplied={isApplied}
                $borderColor={color_toBe}
              />
              
              <div className="flex font-bold">
                <div className="text-xs">
                  <span className="ml-1 text-[#4b5563;]">
                    [TO-BE]{' '}
                    <span className={`ml-1`} style={{ color: color_toBe }}>
                      {isApplied === 'sameAsBefore' 
                        ? "AS-WAS와 TO-BE가 똑같아, 변경이 없습니다." 
                        : isApplied === 'yes' 
                          ? asWasOccurrenceCount === 1 
                            ? "변경이 적용돼요." 
                            : "변경이 적용되나, AS-WAS의 코드 출현 횟수가 2회 이상이라 첫번째 코드만 변경이 적용돼요. 확인이 필요해요." 
                          : isApplied === 'no'
                            ? "원본코드에서 AS-WAS를 찾지 못해, 변경이 적용되지 않습니다."
                            : ""
                      }
                    </span>
                    
                  </span>
                </div>
              </div>

              <CopyTextButton
                text={"코드 복사"}
                value={toBeCode}
                style={{ marginTop: "10px"}}
              />
            </CodeBlock>
          </div>
          {/* Show Default(UK) Code - 260414 기준 불필요하여 삭제*/}
        </div>
      </Wrapper>
    </Container>
  );
};

export default BasicTextarea;



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

const PptNo = styled.div`
  width: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #111827;
`;

const CodeBlock = styled.div`
  width: 100%;
  padding: 5px;
`;

const Textarea = styled.textarea`
  background-color: #d9d9d9;
  width: 100%;
  color: black;
  resize: none;
  height: 130px;
  padding: 0.5rem;
  transition: border-color 0.3s;

  border: 1px solid #ccc;
  border-radius: 4px;
  border-width: 1px;
  border-color: ${({ $borderColor }) => $borderColor};

  &:hover {
    overflow: auto;
  }

  &:focus {
    border-color: #595880;
    outline: none;
  }

  scrollbar-width: thin;
  scrollbar-color: #8a8a8a #e5e7eb;

  &::-webkit-scrollbar {
    width: 8px;
    background: transparent;
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
