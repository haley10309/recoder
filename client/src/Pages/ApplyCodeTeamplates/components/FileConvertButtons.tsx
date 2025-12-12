import styled from "styled-components";

const FileConvertButtons = ({
  fileName,
  isProcessing,
  handleConvertByCountryCode,
}) => {
  return (
    <ButtonBox>
      <ConvertButton
        onClick={handleConvertByCountryCode}
        disabled={isProcessing || !fileName}
        $active={!!fileName && !isProcessing}
      >
        {isProcessing ? "코드 변환 중.." : `AS-WAS → TO-BE 코드 변환`}
      </ConvertButton>
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
  width: 12.9375rem;
  height: 2.5625rem;
  border-radius: 10px;
  color: white;
  background-color: ${({ $active, $bgColor }) =>
    $bgColor || ($active ? "#ff782f" : "#d1d5db")};
  font-weight: 600;
  font-size: 0.9rem;
`;
