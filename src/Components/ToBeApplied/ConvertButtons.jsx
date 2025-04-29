import styled from "styled-components";

export default function ConvertButtons({
  handleExecute,
  handleApplyLocalization,
  isProcessing,
  isLocalizationProcessing,
  isEnglishCountry,
  fileName,
}) {
  return (
    <ButtonBox>
      <ConvertButton
        onClick={handleExecute}
        disabled={isProcessing || !fileName}
        $active={!isProcessing && !!fileName}
      >
        {isProcessing ? "코드 변환 중.." : "코드 변환"}
      </ConvertButton>

      {!isEnglishCountry && (
        <ConvertButton
          $bgColor="black"
          onClick={handleApplyLocalization}
          disabled={isLocalizationProcessing || !fileName}
          $active={!isLocalizationProcessing && !!fileName}
        >
          {isLocalizationProcessing
            ? "로컬라이제이션 적용 중.."
            : "로컬라이제이션 적용"}
        </ConvertButton>
      )}
    </ButtonBox>
  );
}

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
  font-weight: 600;
  font-size: 0.9rem;
  background-color: ${({ $active, $bgColor }) =>
    $bgColor || ($active ? "#ff782f" : "#d1d5db")};
`;
