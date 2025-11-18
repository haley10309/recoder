import { kind_countOccurrences } from "@/utils/codeUtils";
import { useState } from "react";

export function useFileUpload() {
  const [originalFile, setOriginalFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [htmlUploadStatus, setHtmlUploadStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleBackupFileUpload = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setHtmlUploadStatus("fail");
      setUploadStatus("fail");
      return;
    }

    const reader = new FileReader();

    // 파일 읽기 시작할 때
    reader.onloadstart = () => {
      setUploadProgress(0);
    };

    // 파일 읽는 중
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    // 파일 읽기 완료
    reader.onload = () => {
      const content = reader.result;
      setFileContent(content);
      setHtmlUploadStatus("success");
      setFileName(selectedFile.name);
      setOriginalFile(selectedFile);
      setUploadStatus("");
      setUploadProgress(100); // 완료 시 100%
    };

    // 파일 읽기 실패
    reader.onerror = () => {
      setHtmlUploadStatus("fail");
      setUploadStatus("fail");
      setUploadProgress(0);
    };

    reader.readAsText(selectedFile);
  };

  const countOccurrences = (code) => kind_countOccurrences(fileContent, code);

  return {
    originalFile,
    fileContent,
    fileName,
    htmlUploadStatus,
    handleBackupFileUpload,
    countOccurrences,

    // uploadStatus,
    // uploadProgress,
    // setOriginalFile,
    // setFileContent,
    // setFileName,
    // setUploadStatus,
    // setHtmlUploadStatus,
    // setUploadProgress,
  };
}
