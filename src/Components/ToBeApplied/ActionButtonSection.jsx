// import React from "react";
// import styled from "styled-components";

// const ActionButtonSection = ({
//   handleExecute,
//   handleApplyLocalization,
//   isProcessing,
//   isLocalizationProcessing,
//   fileName,
//   isEnglishCountry,
// }) => {
//   const disableExecuteButton = isProcessing || !fileName;
//   const disableLocalizationButton = isLocalizationProcessing || !fileName;

//   return (
//     <ButtonBox>
//       <ConvertButton
//         onClick={handleExecute}
//         disabled={disableExecuteButton}
//         $active={!disableExecuteButton}
//       >
//         {isProcessing ? "코드 변환 중.." : "코드 변환"}
//       </ConvertButton>

//       {!isEnglishCountry && (
//         <ConvertButton
//           $bgColor="black"
//           onClick={handleApplyLocalization}
//           disabled={disableLocalizationButton}
//           $active={!disableLocalizationButton}
//         >
//           {isLocalizationProcessing
//             ? "로컬라이제이션 적용 중.."
//             : "로컬라이제이션 적용"}
//         </ConvertButton>
//       )}
//     </ButtonBox>
//   );
// };

// export default ActionButtonSection;

// const ButtonBox = styled.div`
//   display: flex;
//   gap: 1.5rem;
// `;

// const ConvertButton = styled.button`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 0.5rem;
//   width: 10.9375rem;
//   height: 2.5625rem;
//   border-radius: 10px;
//   color: white;
//   background-color: ${({ $active, $bgColor }) =>
//     $bgColor || ($active ? "#ff782f" : "#d1d5db")};
//   font-weight: 600;
//   font-size: 0.9rem;
// `;
