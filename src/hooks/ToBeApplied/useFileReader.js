// 업로드된 HTML 파일을 읽어와 파일 이름과 본문 내용을 상태로 관리
import { useState } from "react";

export const useFileReader = () => {
  const [originalFile, setOriginalFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setFileContent(reader.result);
    reader.readAsText(file);

    setOriginalFile(file);
    setFileName(file.name);
  };

  return { originalFile, fileName, fileContent, handleFileChange };
};
