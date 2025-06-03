import React from "react";
import styled from "styled-components";
import axios from "axios";

import CustomDropdownInput from "@/Components/Common/CustomDropdownInput";
import { countryOptions } from "@/Components/Common/CoutryCode";
import { BASE_URL } from "@/utils/routePath";
import CheckTemplate from "@/Components/CheckTemplate/CheckTemplate";

const SearchTemplate = ({
  setTextareas,
  setCodeChanges,
  ticketNum,
  ticketUrl,
  setTicketNum,
  setTicketUrl,
  countryCode,
  setCountryCode,
  setIsEnglishCountry,
  // onClick,
}) => {
  // 템플릿 조회
  const templateSearch = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/template`, {
        ticket_num: ticketNum,
        ticket_url: ticketUrl,
      });
  
      if (response.data.template_id) {
        const codeChanges = response.data.code_changes;
        const newTextareas = codeChanges.map((pair) => ({
          asWasCode: pair.aswas_code,
          toBeCode: pair.tobe_code,
          pptNo: pair.ppt_no,
          checked: true,
        }));
  
        setTextareas(newTextareas);
        setCodeChanges(codeChanges);

        alert("성공적으로 템플릿을 불러왔습니다.");
      } else {
        console.warn("⚠️ 실패 응답 메시지:", response.data.message);
        alert(
          response.data.message ||
            "유효하지 않은 템플릿입니다.\n템플릿을 다시 확인해주세요."
        );
      }
    } catch (error) {
      console.error("❌ Error fetching code pairs:", error);
      alert("서버 요청에 실패했습니다. 콘솔을 확인해주세요.");
    }
  };

  const handleSearchTemplate = async () => {
    await templateSearch();
  };

  const handleCountryChange = (inputValue) => {
    setCountryCode(inputValue);

    const selected = countryOptions.find((c) => c.name === inputValue);
    if (selected && selected.isEnglish) {
      setIsEnglishCountry(true);
    } else {
      setIsEnglishCountry(false);
    }
  };

  return (
    <>
      <CheckTemplate
        ticketNum={ticketNum}
        ticketUrl={ticketUrl}
        setTicketNum={setTicketNum}
        setTicketUrl={setTicketUrl}
        // onClick={onClick}
      />
      <Wrapper>
        <InputGrid>
          {/* <InputBox style={{ width: "18rem" }}>
            <InputTitle>지라 티켓 번호</InputTitle>
            <CustomDropdownInput
              value={ticketNumber}
              onChange={handleTicketNumberChange}
              placeholder="지라 티켓 번호"
              options={ticketNumberOptions}
            />
          </InputBox> */}
          {/* <InputBox style={{ width: "24rem" }}>
            <InputTitle>URL</InputTitle>
            <CustomDropdownInput
              value={ticketUrl}
              onChange={setTicketUrl}
              placeholder="/smartphones/galaxy-s24-ultra/compare/"
              options={ticketUrlOptions}
            />
          </InputBox> */}
          <InputBox style={{ width: "6rem" }}>
            <InputTitle>SITECODE</InputTitle>
            <CustomDropdownInput
              value={countryCode}
              onChange={handleCountryChange}
              placeholder="국가 코드 선택"
              options={countryOptions.map((c) => c.name)}
            />
          </InputBox>
        </InputGrid>
        <ButtonBox>
          <ConfirmButton onClick={handleSearchTemplate}>불러오기</ConfirmButton>
        </ButtonBox>
      </Wrapper>
    </>
  );
};

export default SearchTemplate;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  width: 100%;
  padding: 2rem;
  border-radius: 0.375rem;
  background: #f9f9f9;
  box-sizing: border-box;
  margin-bottom: 1rem;
  gap: 2rem;
`;
const InputTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 140%;
`;
const InputGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-grow: 1;
  gap: 3rem;
`;
const InputBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 12rem;
  flex: 0 1 auto;
`;
const ButtonBox = styled.div`
  display: flex;
  align-items: flex-end;
  flex-shrink: 0;
`;
const ConfirmButton = styled.button`
  width: 10.9375rem;
  height: 2.5625rem;
  background-color: #ff6b00;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
`;
