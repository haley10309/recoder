import { useState } from "react";

// html 파일 / 카피덱 xlsx 파일 2개의 업로드 상태를 관리한다.
export function usePreCoderFiles() {
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [htmlFileName, setHtmlFileName] = useState("");
  const [htmlUploadStatus, setHtmlUploadStatus] = useState("");

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelFileName, setExcelFileName] = useState("");
  const [excelUploadStatus, setExcelUploadStatus] = useState("");

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

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setExcelUploadStatus("fail");
      return;
    }
    if (!selectedFile.name.toLowerCase().endsWith(".xlsx") && !selectedFile.name.toLowerCase().endsWith(".xls")) {
      alert("엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.");
      setExcelUploadStatus("fail");
      return;
    }
    setExcelFile(selectedFile);
    setExcelFileName(selectedFile.name);
    setExcelUploadStatus("success");
  };

  const handleResetFiles = () => {
    setHtmlFile(null);
    setHtmlFileName("");
    setHtmlUploadStatus("");
    setExcelFile(null);
    setExcelFileName("");
    setExcelUploadStatus("");
  };

  return {
    htmlFile,
    htmlFileName,
    htmlUploadStatus,
    handleHtmlFileUpload,
    excelFile,
    excelFileName,
    excelUploadStatus,
    handleExcelFileUpload,
    handleResetFiles,
  };
}
