import React, { useState } from "react";
import styled from "styled-components";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";
import SiteCode from "@/Components/Common/SiteCode";

import CheckTemplateBySku from "./components/CheckTemplateBySku";
import FileUploadSection from "./components/FileUploadSection";
import ApplyEntryItem from "./components/ApplyEntryItem";

import { useTemplate } from "./hooks/useTemplate";
import { useFileUpload } from "./hooks/useFileUpload";
import { useExcelUpload } from "./hooks/useExcelUpload";
import { useLocalizationApply } from "./hooks/useLocalizationApply";
import { useFetchTemplate } from "./hooks/useFetchTemplate";

const ApplyUnpackTemplatesScreen = () => {
  // =========================
  // 공통 상태
  // =========================
  const [countryCode, setCountryCode] =
    useState("");

  const [
    englishCopyList,
    setEnglishCopyList,
  ] = useState<any[]>([]);

  // =========================
  // HTML FILE UPLOAD
  // =========================
  const {
    tobeHtmlFile,
    tobeHtmlFileName,

    htmlUploadStatus,

    handleBackupFileUpload,
  } = useFileUpload();

  // =========================
  // EXCEL UPLOAD
  // =========================
  const {
    excelUploadStatus,
    excelUploadProgress,
    excelFileName,

    handleExcelUpload,

    excelFile,
  } = useExcelUpload({
    countryCode,
    setEnglishCopyList,
  });

  // =========================
  // TEMPLATE
  // =========================
  const {
    templateLoading,
    workDate,
    setWorkDate,
    sku,
    setSku,
    textareas,
    setTextareas,
    handleGetTemplate,
    isEnglishCountry,
  } = useTemplate({
    excelFile,
    countryCode,
    setCountryCode,
  });

  // =========================
  // TEMPLATE OPTIONS
  // =========================
  const {
    ticketNumOptions,
    ticketUrlOptions,
    loading: listLoading,
  } = useFetchTemplate({
    shouldFetchOnMount: true,
    ticketNum: workDate,
    ticketUrl: sku,
  });

  // =========================
  // LOCALIZATION
  // =========================
  const {
    processing,
    downloading,

    handleProcessCopy,
    handleLocalizedDownload,
  } = useLocalizationApply({
    tobeHtmlFile,
    textareas,
    setTextareas,
    workDate,
    sku,
    countryCode,
  });

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText
        text={"Unpack 템플릿 기반으로 HTML 파일 국가별 번역 적용"}
      />

      <Gap gap={50} />

      {/* ========================= */}
      {/* TEMPLATE */}
      {/* ========================= */}
      <TitleLabel text="📄 템플릿 불러오기" />

      <Gap gap={15} />

      <CheckTemplateBySku
        loading={listLoading}
        dateOptions={ticketNumOptions}
        skuOptions={ticketUrlOptions}
        workDate={workDate}
        setWorkDate={setWorkDate}
        sku={sku}
        setSku={setSku}
      />

      <Gap gap={50} />

      {/* ========================= */}
      {/* FILE UPLOAD */}
      {/* ========================= */}
      <TitleLabel text="📤 파일 업로드" />

      <Gap gap={15} />

      <FileUploadSection
        tobeHtmlFileName={tobeHtmlFileName}
        htmlUploadStatus={htmlUploadStatus}
        handleBackupFileUpload={handleBackupFileUpload}
        excelUploadStatus={excelUploadStatus}
        excelUploadProgress={excelUploadProgress}
        excelFileName={excelFileName}
        handleExcelUpload={handleExcelUpload}
        countryCode={countryCode}
      />

      <Gap gap={50} />

      {/* ========================= */}
      {/* COUNTRY */}
      {/* ========================= */}
      <TitleLabel text="🌐 국가코드 선택" />

      <Gap gap={15} />

      <SiteCode
        countryCode={countryCode}
        handleCountryChange={setCountryCode}
        isEnglishCountry={isEnglishCountry}
        isDisabled={!workDate || !sku}
      />

      <Gap gap={30} />

      {isEnglishCountry ? (
        <>
          <TitleLabel
            text="영문국은 번역 대상이 아닙니다"
            style={{
              textAlign: "center",
            }}
          />
          <Gap gap={1000} />
        </>
      ) : (
        <>
          {/* ========================= */}
          {/* TEMPLATE LOAD BUTTON */}
          {/* ========================= */}
          <div className="flex justify-start items-center">
            <button
              className="flex justify-center items-center gap-2 bg-[#FF782F] text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[175px] disabled:bg-gray-300"
              onClick={handleGetTemplate}
              disabled={
                templateLoading ||
                !workDate?.trim() ||
                !sku?.trim() ||
                !countryCode ||
                !excelFile
              }
            >
              {templateLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}

              {templateLoading
                ? "불러오는 중..."
                : "템플릿 불러오기"}
            </button>
          </div>

          <Gap gap={50} />

          {/* ========================= */}
          {/* COPY SECTION */}
          {/* ========================= */}
          <div className="flex justify-between items-center">
            <TitleLabel text="✅ 적용할 Copy 확인하기" />

            <div className="flex gap-[10px]">
              {/* 가공하기 */}
              <button
                className="flex justify-center items-center bg-[#FF782F] text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[140px] disabled:bg-gray-300"
                onClick={handleProcessCopy}
                disabled={processing || textareas.length === 0}
              >
                {processing ? "가공 중..." : "가공하기"}
              </button>

              {/* 다운로드 */}
              <button
                className="flex justify-center items-center bg-black text-white font-[600] text-[13px] rounded-[10px] h-[42px] w-[200px] disabled:bg-gray-300"
                onClick={handleLocalizedDownload}
                disabled={downloading || textareas.length === 0}
              >
                {downloading ? "다운로드 중..." : "변환된 코드 다운로드"}
              </button>
            </div>
          </div>

          <Gap gap={15} />

          {/* ========================= */}
          {/* COPY LIST */}
          {/* ========================= */}
          <WhiteBox>
            <div className="flex flex-col gap-[20px]">
              {textareas.map(
                (entry, index) => (
                  <ApplyEntryItem
                    key={`apply-entry-${index}`}
                    entry={entry}
                    index={index}
                    totalLength={textareas.length}
                    onChange={(idx, value) => {
                      setTextareas((prev) => {
                        const copy = [...prev];
                        copy[idx].appliedCopy = value;
                        return copy;
                      });
                    }}
                  />
                )
              )}
            </div>
          </WhiteBox>

          <Gap gap={50} />
        </>
      )}
    </div>
  );
};

export default ApplyUnpackTemplatesScreen;

const WhiteBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #32383e;
`;