import React from "react";
import styled from "styled-components";

import CustomDropdownInput from "@/Components/Common/CustomDropdownInput";
import { countryOptions } from "@/Components/Common/CoutryCode";

const SiteCode = ({
  countryCode,
  handleCountryChange,
}) => {

  return (
    <Wrapper>
      <InputGrid>
        <InputBox style={{ width: "6rem" }}>
          <InputTitle>SITECODE</InputTitle>
          <CustomDropdownInput
            value={countryCode}
            onChange={handleCountryChange}
            placeholder="국가코드 선택"
            options={countryOptions.map((c) => c.name)}
          />
        </InputBox>
      </InputGrid>
    </Wrapper>
  );
};

export default SiteCode;

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
