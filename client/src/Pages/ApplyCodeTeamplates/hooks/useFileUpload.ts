import { kind_countOccurrences } from "@/utils/codeUtils";
import { useState } from "react";

export function useFileUpload() {
  // File 객체를 담으므로 File | null 로 명시한다.
  // 타입을 생략하면 null 로 추론되어 소비 측에서 backupHtmlFile?.name 접근 시
  // never 타입 에러가 발생한다.
  const [backupHtmlFile, setOriginalFile] = useState<File | null>(null);
  const [backupHtmlContent, setBackupHtmlContent] = useState("");

  const [htmlUploadStatus, setHtmlUploadStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const countOccurrences = (code: string) =>
    kind_countOccurrences(backupHtmlContent, code);

  const handleBackupHtmlFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      console.error("[useFileUpload] 선택된 파일이 없습니다.");
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

      // readAsText 사용 시 result 는 string 이지만
      // 타입 정의상 string | ArrayBuffer | null 이므로 방어한다.
      if (typeof content !== "string") {
        console.error(
          "[useFileUpload] 파일 내용을 문자열로 읽지 못했습니다:",
          selectedFile.name
        );
        setHtmlUploadStatus("fail");
        setUploadStatus("fail");
        setUploadProgress(0);
        return;
      }

      setBackupHtmlContent(content);
      setHtmlUploadStatus("success");
      setOriginalFile(selectedFile);
      setUploadStatus("");
      setUploadProgress(100); // 완료 시 100%
    };

    // 파일 읽기 실패
    reader.onerror = () => {
      console.error(
        "[useFileUpload] 파일 읽기 실패:",
        selectedFile.name,
        reader.error
      );
      setHtmlUploadStatus("fail");
      setUploadStatus("fail");
      setUploadProgress(0);
    };

    reader.readAsText(selectedFile);
  };

  return {
    backupHtmlFile,
    backupHtmlContent,
    htmlUploadStatus,
    handleBackupHtmlFileUpload,
    countOccurrences,
  };
}