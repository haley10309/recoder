import { useState } from "react";

const isExcelFileName = (name: string) => {
  const lower = name.toLowerCase();
  return lower.endsWith(".xlsx") || lower.endsWith(".xls");
};

// 카피덱 xlsx 슬롯 하나의 업로드 상태를 관리한다.
function useExcelSlot() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setUploadStatus("fail");
      return;
    }
    if (!isExcelFileName(selectedFile.name)) {
      alert("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
      setUploadStatus("fail");
      return;
    }
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setUploadStatus("success");
  };

  const reset = () => {
    setFile(null);
    setFileName("");
    setUploadStatus("");
  };

  return { file, fileName, uploadStatus, handleUpload, reset };
}

// html 파일 / 카피덱 xlsx 파일의 업로드 상태를 관리한다.
// excel* 는 기본 카피덱(① features / ② FAQ / ③ Schema 개별 검사, ④ 전체 검사의 features 카피덱)이고,
// faqExcel* / schemaExcel* 는 ④ 전체 검사에서만 쓰는 FAQ / Schema 카피덱이다.
export function usePreCoderFiles() {
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [htmlFileName, setHtmlFileName] = useState("");
  const [htmlUploadStatus, setHtmlUploadStatus] = useState("");

  const excel = useExcelSlot();
  const faqExcel = useExcelSlot();
  const schemaExcel = useExcelSlot();

  const handleHtmlFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setHtmlUploadStatus("fail");
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".html") && !selectedFile.name.toLowerCase().endsWith(".htm")) {
      alert("html 파일(.html)만 업로드 가능합니다.");
      setHtmlUploadStatus("fail");
      return;
    }
    setHtmlFile(selectedFile);
    setHtmlFileName(selectedFile.name);
    setHtmlUploadStatus("success");
  };

  const handleResetFiles = () => {
    setHtmlFile(null);
    setHtmlFileName("");
    setHtmlUploadStatus("");
    excel.reset();
    faqExcel.reset();
    schemaExcel.reset();
  };

  return {
    htmlFile,
    htmlFileName,
    htmlUploadStatus,
    handleHtmlFileUpload,
    excelFile: excel.file,
    excelFileName: excel.fileName,
    excelUploadStatus: excel.uploadStatus,
    handleExcelFileUpload: excel.handleUpload,
    faqExcelFile: faqExcel.file,
    faqExcelFileName: faqExcel.fileName,
    faqExcelUploadStatus: faqExcel.uploadStatus,
    handleFaqExcelFileUpload: faqExcel.handleUpload,
    schemaExcelFile: schemaExcel.file,
    schemaExcelFileName: schemaExcel.fileName,
    schemaExcelUploadStatus: schemaExcel.uploadStatus,
    handleSchemaExcelFileUpload: schemaExcel.handleUpload,
    handleResetFiles,
  };
}
