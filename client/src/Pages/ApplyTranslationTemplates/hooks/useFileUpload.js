import { useState } from "react";

import { kind_countOccurrences } from "@/utils/codeUtils";

export function useFileUpload() {
  const [tobeHtmlFile, setTobeHtmlFile] = useState(null);
  const [tobeHtmlContent, setTobeHtmlContent] = useState("");
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
      setTobeHtmlFile(selectedFile);
      const content = reader.result
      setTobeHtmlContent(content);
      setHtmlUploadStatus("success");
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

  const countOccurrences = (code) => kind_countOccurrences(tobeHtmlContent, code);

  return {
    tobeHtmlFile,
    tobeHtmlFileName: tobeHtmlFile?.name ?? "",
    tobeHtmlContent,
    htmlUploadStatus,
    handleBackupFileUpload,
    countOccurrences,
  };
}
