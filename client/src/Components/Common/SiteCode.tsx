import React from "react";
import styled from "styled-components";

import CustomDropdownInput from "@/Components/Common/CustomDropdownInput";
import Gap from "@/Components/Common/Gap";

import { countryOptions } from "@/utils/countryOptions";

const SiteCode = ({
  countryCode,
  handleCountryChange,
  isEnglishCountry,
  isDisabled,
}) => {

  return (
    <Wrapper style={{ pointerEvents: isDisabled ? "none" : undefined, opacity: isDisabled ? 0.5 : 1 }}>
      <InputTitle>Site Code</InputTitle>
      <Gap gap={5} />
      <InputGrid>
        <CustomDropdownInput
          value={countryCode}
          onChange={handleCountryChange}
          placeholder="국가코드 선택"
          options={countryOptions.map((c) => c.name)}
        />
        <div style={{ fontSize: "14px", fontWeight: "700", color: isEnglishCountry === false ? "#A68A64" : "#2A9D8F" }}>
          {isEnglishCountry === null
            ? ""
            : `${countryCode} : ${isEnglishCountry ? "영문국" : "비영문국"}입니다.`
          }
        </div>
      </InputGrid>
    </Wrapper>
  );
};

export default SiteCode;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem;
  border-radius: 0.375rem;
  background: #f9f9f9;
  box-sizing: border-box;
`;
const InputGrid = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  gap: 25px;
`;
const InputTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
`;
