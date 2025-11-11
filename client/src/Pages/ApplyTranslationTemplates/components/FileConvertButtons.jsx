import React from "react";
import styled from "styled-components";

const FileConvertButtons = ({
  fileName,
  isEnglishCountry,
  handleApplyLocalization,
}) => {
  return (
    <ButtonBox>
      {/* <ConvertButton
        onClick={handleConvertByCountryCode}
        disabled={isProcessing || !fileName}
        $active={!!fileName && !isProcessing}
      >
        {"코드 출현 횟수 확인하기"}
      </ConvertButton> */}

      {isEnglishCountry === false && (
        <ConvertButton
          $bgColor="black"
          onClick={handleApplyLocalization}
          disabled={!fileName}
          $active={!!fileName}
        >
          로컬라이제이션 적용
        </ConvertButton>
      )}
    </ButtonBox>
  );
};

export default FileConvertButtons;

const ButtonBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const ConvertButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 10.9375rem;
  height: 2.5625rem;
  border-radius: 10px;
  color: white;
  background-color: ${({ $active, $bgColor }) =>
    $bgColor || ($active ? "#ff782f" : "#d1d5db")};
  font-weight: 600;
  font-size: 0.9rem;
`;
