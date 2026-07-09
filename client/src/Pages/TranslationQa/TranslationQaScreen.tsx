import React, { useState } from "react";
import styled from "styled-components";

import PageDescriptionText from "@/Components/Common/PageDescriptionText";
import TitleLabel from "@/Components/Common/TitleLabel";
import Gap from "@/Components/Common/Gap";
import SiteCode from "@/Components/Common/SiteCode";

import { countryOptions } from "@/utils/countryOptions";

import TranslationQaFileUploadSection from "./components/TranslationQaFileUploadSection";
import TranslationQaResultTable from "./components/TranslationQaResultTable";
import CopyDeckCoverage from "./components/CopyDeckCoverage";

import { useTranslationQaFiles } from "./hooks/useTranslationQaFiles";
import { useTranslationQaVerify } from "./hooks/useTranslationQaVerify";

// translation-qa: 언팩 번역이 after.html에 잘 반영됐는지 검사하는 화면.
// before.html / after.html / copy.xlsx 를 올리면 data-copy-set별로 apply_type에 맞게
// 번역 카피가 반영됐는지 확인한다.
const TranslationQaScreen = () => {
  const [countryCode, setCountryCode] = useState("");

  const isEnglishCountry =
    countryCode === ""
      ? null
      : countryOptions.find((c) => c.name === countryCode)
      ? !!countryOptions.find((c) => c.name === countryCode)?.isEnglish
      : null;

  const {
    beforeFile,
    beforeFileName,
    beforeUploadStatus,
    handleBeforeFileUpload,
    afterFile,
    afterFileName,
    afterUploadStatus,
    handleAfterFileUpload,
    excelFile,
    excelFileName,
    excelUploadStatus,
    handleExcelFileUpload,
    handleResetFiles,
  } = useTranslationQaFiles();

  const { blocks, verifyStatus, handleVerify, resetVerify } = useTranslationQaVerify({
    beforeFile,
    afterFile,
    excelFile,
    siteCode: countryCode,
  });

  const canVerify =
    !!beforeFile && !!afterFile && !!excelFile && !!countryCode;

  const handleResetFilesAndResult = () => {
    handleResetFiles();
    resetVerify();
  };

  const getStatusText = () => {
    if (verifyStatus === "loading") return "검사 중...";
    if (verifyStatus === "success") return "검사 완료!";
    if (verifyStatus === "fail") return "검사 실패";
    return null;
  };

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText
        text={
          "언팩 번역이 실제 코드(after.html)에 잘 반영됐는지 검사합니다. before.html / after.html / copy.xlsx 를 올리면 data-copy-set별로 apply_type에 맞게 번역이 적용됐는지 확인합니다"
        }
      />
      <Gap gap={50} />

      <TitleLabel text="🌐 Site Code 선택" />
      <Gap gap={15} />
      <SiteCode
        countryCode={countryCode}
        handleCountryChange={setCountryCode}
        isEnglishCountry={isEnglishCountry}
        isDisabled={false}
      />
      <Gap gap={50} />

      <TitleLabel text="📤 파일 업로드" />
      <Gap gap={15} />
      <TranslationQaFileUploadSection
        beforeFileName={beforeFileName}
        beforeUploadStatus={beforeUploadStatus}
        handleBeforeFileUpload={handleBeforeFileUpload}
        afterFileName={afterFileName}
        afterUploadStatus={afterUploadStatus}
        handleAfterFileUpload={handleAfterFileUpload}
        excelFileName={excelFileName}
        excelUploadStatus={excelUploadStatus}
        handleExcelFileUpload={handleExcelFileUpload}
      />
      <Gap gap={15} />
      <ResetButtonsRow>
        <ResetButton onClick={handleResetFilesAndResult}>파일 초기화</ResetButton>
      </ResetButtonsRow>

      <ActionBox>
        <VerifyButton $active={canVerify} disabled={!canVerify} onClick={handleVerify}>
          검사 실행
        </VerifyButton>
        <StatusText>{getStatusText()}</StatusText>
      </ActionBox>
      <Gap gap={50} />

      <CopyDeckCoverage blocks={blocks} verifyStatus={verifyStatus} />
      <Gap gap={30} />

      <TitleLabel text="✅ data-copy-set 별 번역 매칭 검사" />
      <Gap gap={15} />
      <WhiteBox>
        <TranslationQaResultTable blocks={blocks} />
      </WhiteBox>

      <Gap gap={50} />
    </div>
  );
};

export default TranslationQaScreen;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
`;

const ResetButtonsRow = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const ResetButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.25rem;
  padding: 0 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9f9f9;
  color: #4b5563;
  font-size: 0.8rem;
  font-weight: 600;

  &:hover {
    background: #f3f4f6;
  }
`;

const ActionBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
`;

const VerifyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 13.9375rem;
  height: 2.5625rem;
  border-radius: 10px;
  color: white;
  background-color: ${({ $active }) => ($active ? "#ff782f" : "#d1d5db")};
  font-weight: 600;
  font-size: 0.9rem;
`;

const StatusText = styled.div`
  font-size: 13px;
  color: #4b5563;
`;
