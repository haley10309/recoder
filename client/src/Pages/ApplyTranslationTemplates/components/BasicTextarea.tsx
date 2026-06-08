import React, { useState } from "react";
import styled from "styled-components";

import CopyTextButton from "@/Components/Common/CopyTextButton";
import TransBox from "./TransBox";

const BasicTextarea = ({
  indexText,
  localizationEntryId,
  toBeCode = "",
  setToBeCode,
  localizedToBeCode = "",
  setLocalizedToBeCode,
  errorState,
  countOccurrencesResult_tobe,
  highlights = [], 
  hasTobeHtmlFile, 
  // multi-select
  matchingEnglishCopies = [],
  selectedEnglishCopies, 
  onSelectEnglishCopies = () => {},
}) => {
  const [isMatchedPartVisible, setIsMatchedPartVisible] = useState(false);

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

  // TODO: 코드 출현횟수가 0회면 아예 handleLocal 할 때 제외하는 로직 추가
  // TODO: 실제로 convert 요청하는 로직 확인하고, 리드미 문서 마무리
  // TODO: 지금은 단순히 다른지만 판단하지만, 추후에는 실제 번역value가 적용돘는지 확인하는 것으로 수정 필요
  const isLocalizedChanged =
    localizedToBeCode && (localizedToBeCode !== toBeCode);

  const displaySelectedEnglishCopies = selectedEnglishCopies === undefined ? matchingEnglishCopies : selectedEnglishCopies;

  return (
    <Container>
      <div style={{ fontSize: "12px", paddingLeft: "15px", paddingTop: "10px" }}>{indexText}</div>
      <Wrapper>
        <IdBox>
          <TextBold>id. {localizationEntryId}</TextBold>

          {/* 영어 원문 선택 영역 */}
          {matchingEnglishCopies?.length > 0 && (
          <div
            style={{
              marginTop: "8px",
              width: "100px", 
              maxHeight: "180px", 
              overflowY: "auto",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "6px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                marginBottom: "4px",
              }}
            >
              English Copy
            </div>

            {matchingEnglishCopies.map((copy, idx) => {
              const truncated = copy.length > 28 ? copy.slice(0, 28) + "…" : copy;

              return (
                <label
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                    marginBottom: "3px",
                    fontSize: "11px",
                  }}
                  title={copy} // hover하면 전체 표시됨
                >
                  <input
                    type="checkbox"
                    name={`eng-copy-${localizationEntryId}`}
                    value={copy}
                    checked={displaySelectedEnglishCopies.includes(copy)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // ✔ 선택됨 → 배열에 추가
                        onSelectEnglishCopies([...displaySelectedEnglishCopies, copy]);
                      } else {
                        // ✔ 해제됨 → 배열에서 제거
                        onSelectEnglishCopies(
                          displaySelectedEnglishCopies.filter((c) => c !== copy)
                        );
                      }
                    }}
                    style={{ margin: 0 }}
                  />

                  <span
                    style={{
                      display: "inline-block",
                      maxWidth: "140px", // 고정 width 안에서 ellipsis 처리
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {truncated}
                  </span>
                </label>
              );
            })}
          </div>
        )}
        </IdBox>

          {/* {matchedPart && (
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
          )} */}

        {/* TO-BE */}
        <CodeBlock>
          {/* <Textarea
            value={toBeCode}
            onChange={(e) => handleChangeToBeCode(e.target.value)}
            placeholder="TO-BE code를 입력하세요."
          />
          <div className="h-[180px] bg-[#e4e4e4] rounded-[5px] text-[16px] font-[500] whitespace-pre-wrap break-all outline-none border border-[#ccc] focus:border-[#595880] translate-scroll">
            <div
              ref={toBeCodeRef}
              contentEditable
              suppressContentEditableWarning
              // onBlur={handleToBeCodeBlur}
            />
          </div>
          <button onClick={handleApplyHighlight}>Apply Highlight</button> */}

          <TransBox
            codeContext={toBeCode}
            highlights={highlights}
            onChange={(val) => setToBeCode(val)}
          />
          
          <div className="flex font-bold">
            <div className="text-xs">
              <span className="ml-1 text-[#4b5563;]">
                [TO-BE] HTML 내 TO-BE 코드 출현 횟수:{" "}
                {/** TODO: 원본코드 업로드 안했으면 그거 텍스트 띄우기 */}
                <span className="ml-1 text-xs"
                  style={{
                    color: countOccurrencesResult_tobe === 1 ? "blue" : "red"
                  }}>
                    {`${countOccurrencesResult_tobe}회`}
                </span>
              </span>
            </div>
          </div>

          <CopyTextButton
            text={"코드 복사"}
            value={toBeCode}
          />
        </CodeBlock>

        {/* LOCALIZED TO-BE */}
        <CodeBlock>
          <Textarea
            value={localizedToBeCode ?? ""}
            onChange={(e) => setLocalizedToBeCode(e.target.value)}
            placeholder="Localization을 적용하세요."
            $isLocalizedChanged={isLocalizedChanged}
            $errorState={errorState}
          />
          <CopyTextButton
            text={"코드 복사"}
            value={localizedToBeCode || ""}
          />
          {errorState && (
            <ErrorMessage>
              🚨 아직 번역되지 않은 key가 포함되어 있습니다. 확인이 필요해요.
            </ErrorMessage>
          )}
        </CodeBlock>
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

const IdBox = styled.div`
  width: 10%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #111827;
`;

const TextBold = styled.span`
  font-weight: bold;
`;

const CodeBlock = styled.div`
  width: 42%;
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

  border: ${({ $errorState, $isLocalizedChanged }) => {
    if ($errorState) return "2px solid #ffa600";
    if ($isLocalizedChanged) return "4px solid green";
    return "1px solid #d1d5db";
  }};

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

const ErrorMessage = styled.div`
  font-size: 12px;
  color: #ffa600;
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
