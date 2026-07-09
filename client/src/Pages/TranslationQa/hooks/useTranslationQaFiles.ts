import { useState } from "react";

// before.html / after.html / copy.xlsx 3개 파일 업로드 상태를 관리한다.
export function useTranslationQaFiles() {
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [beforeFileName, setBeforeFileName] = useState("");
  const [beforeUploadStatus, setBeforeUploadStatus] = useState("");

  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [afterFileName, setAfterFileName] = useState("");
  const [afterUploadStatus, setAfterUploadStatus] = useState("");

  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelFileName, setExcelFileName] = useState("");
  const [excelUploadStatus, setExcelUploadStatus] = useState("");

  const makeHandler =
    (
      setFile: (f: File | null) => void,
      setName: (n: string) => void,
      setStatus: (s: string) => void
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) {
        setStatus("fail");
        return;
      }
      setFile(selectedFile);
      setName(selectedFile.name);
      setStatus("success");
    };

  const handleBeforeFileUpload = makeHandler(
    setBeforeFile,
    setBeforeFileName,
    setBeforeUploadStatus
  );
  const handleAfterFileUpload = makeHandler(
    setAfterFile,
    setAfterFileName,
    setAfterUploadStatus
  );
  const handleExcelFileUpload = makeHandler(
    setExcelFile,
    setExcelFileName,
    setExcelUploadStatus
  );

  const handleResetFiles = () => {
    setBeforeFile(null);
    setBeforeFileName("");
    setBeforeUploadStatus("");
    setAfterFile(null);
    setAfterFileName("");
    setAfterUploadStatus("");
    setExcelFile(null);
    setExcelFileName("");
    setExcelUploadStatus("");
  };

  return {
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
  };
}
