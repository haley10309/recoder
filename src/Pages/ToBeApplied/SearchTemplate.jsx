import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useRecoilState, useSetRecoilState, useRecoilValue } from "recoil"; // ✅ 여기에 추가
import {
  ticketNumState,
  ticketUrlState,
  countryCodeState,
} from "@/recoil/atoms/state";
import CustomDropdownInput from "@/Components/Common/CustomDropdownInput";
import { countryOptions } from "@/Components/Common/CoutryCode";
import { templateSearch, templateOption } from "@/apis/apis";

const SearchTemplate = ({ setTextareas, setCodePairs }) => {
  const [ticketNumber, setTicketNumber] = useState(""); // 지라 티켓 번호
  const setTicketNum = useSetRecoilState(ticketNumState);
  const [ticketUrl, setTicketUrl] = useRecoilState(ticketUrlState); // 티켓에 해당하는 URL (Recoil)
  const [country_code, setCountry_code] = useRecoilState(countryCodeState);

  const handleTicketNumberChange = (value) => {
    setTicketNumber(value);
    setTicketNum(value); // 👈 Recoil 업데이트
  };

  const [ticketNumberOptions, setTicketNumberOptions] = useState([]); // 티켓 번호 드롭다운 옵션
  const [ticketUrlOptions, setTicketUrlOptions] = useState([]); // URL 드롭다운 옵션

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const ticketData = await templateOption("get-ticket-number");
        const urlData = await templateOption("get-ticket-url");

        setTicketNumberOptions(ticketData.map((t) => t.name));
        setTicketUrlOptions(urlData.map((u) => u.name));
      } catch (err) {
        console.error("옵션 로딩 실패:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleSearchTemplate = async () => {
    await templateSearch(
      ticketNumber,
      ticketUrl,
      setTextareas,
      setCodePairs
    );
  };

  return (
    <>
      <Title>🧾 핫픽스/로컬라이제이션 템플릿 불러오기</Title>
      <Wrapper>
        <InputGrid>
          <InputBox>
            <InputTitle>지라 티켓 번호</InputTitle>
            <CustomDropdownInput
              value={ticketNumber}
              onChange={handleTicketNumberChange}
              placeholder="지라 티켓 번호"
              options={ticketNumberOptions}
            />
          </InputBox>
          <InputBox>
            <InputTitle>URL</InputTitle>
            <CustomDropdownInput
              value={ticketUrl}
              onChange={setTicketUrl}
              placeholder="/smartphones/galaxy-s24-ultra/compare/"
              options={ticketUrlOptions}
            />
          </InputBox>
          <InputBox>
            <InputTitle>SITECODE</InputTitle>
            <CustomDropdownInput
              value={country_code}
              onChange={setCountry_code}
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

const Title = styled.p`
  font-size: 1rem;
  font-style: normal;
  font-weight: 700;
  line-height: 140%;
  margin-bottom: 0.94rem;
`;

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
  min-width: 200px;
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

// import SettingDropdown from "@/Components/ToBeApplied/SettingDropdown";
// import Country_code from "@/Components/ToBeApplied/CountryCode";
// import { useState } from "react";
// import { useRecoilState } from "recoil";
// import { templateSearch } from "@/apis/apis";
// import { countryCodeState } from "@/recoil/atoms/state";
// import { ticketUrlState } from "../../recoil/atoms/state";
// import styled from "styled-components";

// const Wrapper = styled.div`
//   display: flex;
//   flex-direction: column;
//   padding: 32px;
//   background-color: white;
//   border-radius: 10px;
//   border: 1px solid #d1d5db;
//   color: #32383e;
// `;

// const Title = styled.h2`
//   font-weight: bold;
//   color: black;
//   margin-bottom: 20px;
//   font-size: 16px;
// `;

// const FlexColumn = styled.div`
//   display: flex;
//   flex-direction: column;
//   width: 100%;
// `;

// const TopRow = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// `;

// const LeftInputs = styled.div`
//   display: flex;
//   justify-content: flex-start;
//   align-items: center;
//   padding: 0 8px;
//   overflow-x: auto;
// `;

// const LoadButtonWrapper = styled.div`
//   display: flex;
//   justify-content: center;
// `;

// const LoadButton = styled.button`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   background-color: #009900;
//   color: white;
//   font-weight: 600;
//   font-size: 13px;
//   border-radius: 10px;
//   height: 40px;
//   width: 130px;
// `;

// const SearchTemplate = ({ setTextareas, setCodePairs }) => {
//   const [ticketNum, setTicketNum] = useState("");
//   const [ticketURL, setTicketURL] = useRecoilState(ticketUrlState);
//   const [country_code, setCountry_code] = useRecoilState(countryCodeState);

//   const handleSetting = async () => {
//     templateSearch(ticketNum, ticketURL, setTextareas, setCodePairs);
//   };

//   return (
//     <Wrapper>
//       <Title>템플릿 불러오기</Title>
//       <FlexColumn>
//         <TopRow>
//           <LeftInputs>
//             <SettingDropdown
//               _inputProps={{ placeholder: "WSC20200078-9816" }}
//               _title="Jira 티켓 번호"
//               _onChange={() => {}}
//               _value={ticketNum}
//               _setValue={setTicketNum}
//               _url="get-ticket-number"
//             />
//             <SettingDropdown
//               _inputProps={{
//                 placeholder: "/smartphones/galaxy-s24-ultra/compare/",
//               }}
//               _title="Page URL"
//               _onChange={() => {}}
//               _value={ticketURL}
//               _setValue={setTicketURL}
//               _url="get-ticket-url"
//             />
//             <Country_code
//               country_code={country_code}
//               setCountry_code={setCountry_code}
//             />
//           </LeftInputs>
//           <LoadButtonWrapper>
//             <LoadButton onClick={handleSetting}>불러오기</LoadButton>
//           </LoadButtonWrapper>
//         </TopRow>
//       </FlexColumn>
//     </Wrapper>
//   );
// };

// export default SearchTemplate;
