import { useState } from "react";
import { fileExecute } from "@/apis/apis";
import { countOccurrences } from "@/utils/codeUtils";

export function useFileExecute({
  originalFile,
  fileContent,
  textareas,
  setTextareas,
  country_code,
  ticketUrl,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadedFileContent, setDownloadedFileContent] = useState("");
  const [downloadedFileName, setDownloadedFileName] = useState("");

  const handleChangeResults = (changeResults) => {
    const updatedTextareas = textareas.map((textarea, index) => {
      const { changed, matchedPart } =
        changeResults.find((result) => result.pairIndex === index) || {};

      const asWasOccurrenceCount = countOccurrences(
        fileContent,
        textarea.asWasCode
      );
      const toBeOccurrenceCount = countOccurrences(
        downloadedFileContent,
        textarea.toBeCode
      );
      const lowerCaseCode = country_code?.toLowerCase?.() || "";

      const normalizePath = (code) =>
        code?.replace(new RegExp(`/${lowerCaseCode}/`, "g"), "/site/")?.trim();

      const normalizedAsWas = normalizePath(textarea.asWasCode);
      const normalizedToBe = normalizePath(textarea.toBeCode);

      const actualChanged = normalizedAsWas !== normalizedToBe;
      const isFound = asWasOccurrenceCount > 0;

      return {
        ...textarea,
        pptNo: textarea.pptNo,
        changed: isFound && actualChanged,
        isApplied: isFound ? (actualChanged ? "yes" : "no") : "no",
        matchedPart: matchedPart,
        asWasOccurrenceCount,
        toBeOccurrenceCount,
        asWasCode: textarea.asWasCode.replace(
          /\/site\//g,
          `/${lowerCaseCode}/`
        ),
        toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
      };
    });

    setTextareas(updatedTextareas);
  };

  const handleExecute = async () => {
    const lowerCaseCode = country_code?.toLowerCase?.() || "";

    const updatedTextareas = textareas.map((textarea) => ({
      ...textarea,
      pptNo: textarea.pptNo,
      asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
      toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${lowerCaseCode}/`),
      changed: textarea.asWasCode !== "",
    }));

    setTextareas(updatedTextareas);
    setIsExecuted(true);
    setUploadProgress(0);

    if (
      originalFile &&
      updatedTextareas.every(
        ({ asWasCode, toBeCode }) =>
          asWasCode && (toBeCode !== null || toBeCode === "")
      )
    ) {
      const formData = new FormData();
      formData.append("file", originalFile);

      const codePairs = updatedTextareas
        .filter((textarea) => textarea.changed)
        .map((textarea) => ({
          asWasCode: textarea.asWasCode,
          toBeCode: textarea.toBeCode,
        }));

      formData.append("codePairs", JSON.stringify(codePairs));

      setIsProcessing(true);

      try {
        const { fileContent, filename } = await fileExecute(
          () => {},
          handleChangeResults,
          setIsProcessing,
          formData,
          updatedTextareas,
          setTextareas,
          ticketUrl,
          country_code
        );

        setDownloadedFileContent(fileContent);
        setDownloadedFileName(filename);
        setUploadStatus("success");
      } catch (error) {
        console.error("파일 실행 오류", error);
        setUploadStatus("fail");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert("파일 선택, asWasCode, toBeCode 입력은 필수입니다.");
    }
  };

  return {
    isProcessing,
    isExecuted,
    uploadProgress,
    uploadStatus,
    downloadedFileContent,
    downloadedFileName,
    handleExecute,
  };
}
