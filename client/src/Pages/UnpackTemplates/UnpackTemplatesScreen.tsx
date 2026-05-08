import React from "react";

import Gap from "@/Components/Common/Gap";
import TitleLabel from "@/Components/Common/TitleLabel";
import PageDescriptionText from "@/Components/Common/PageDescriptionText";

import ExcelFileUpload from "./components/ExcelFileUpload";
import LocalizationEntriesEditor from "./components/LocalizationEntriesEditor";
import CheckTemplateBySku from "./components/CheckTemplateBySku";

import { useTemplate } from "./hooks/useTemplate";
import { useExcelUpload } from "./hooks/useExcelUpload";
import { useFetchTemplate } from "./hooks/useFetchTemplate";

const UnpackTemplatesScreen = () => {
  const {
    sku,
    setSku,
    workDate,
    setWorkDate,
    localizationEntries,
    setLocalizationEntries,
    loading,
    handleGetTemplate,
    handleSaveTemplate,
    handleDeleteLocalizationEntry,
  } = useTemplate();

  const {
    ticketNumOptions,
    ticketUrlOptions,
    loading: listLoading,
  } = useFetchTemplate({
    shouldFetchOnMount: true,
    ticketNum: sku,
    ticketUrl: workDate,
  });

  const {
    excelFile,
    handleExcelFileChange,
  } = useExcelUpload({
    setLocalizationEntries,
  });

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      <Gap gap={15} />

      <PageDescriptionText text={"copy deck translation 템플릿 관리"} />
      <Gap gap={50} />

      <TitleLabel text="📄 템플릿 불러오기" />
      <Gap gap={15} />
      <CheckTemplateBySku
        sku={sku}
        setSku={setSku}
        workDate={workDate}
        setWorkDate={setWorkDate}
        skuOptions={ticketNumOptions}
        dateOptions={ticketUrlOptions}
        loading={listLoading}
        handleGetTemplate={handleGetTemplate}
      />
      <Gap gap={50} />

      {/* 📤 업로드 */}
      <TitleLabel text="📤 엑셀 파일 업로드" />
      <Gap gap={15} />
      <ExcelFileUpload
        excelFile={excelFile}
        handleExcelFileChange={handleExcelFileChange}
      />

      <Gap gap={50} />

      {/* ✅ 템플릿 */}
      <TitleLabel text="✅ Copy Deck 번역 템플릿" />
      <Gap gap={15} />
      <LocalizationEntriesEditor
        localizationEntries={localizationEntries}
        onSave={handleSaveTemplate}
        onDelete={handleDeleteLocalizationEntry}
      />
    </div>
  );
};

export default UnpackTemplatesScreen;