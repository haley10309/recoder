import { useEffect, useState } from "react";

import { convertAsWasToToBeCodes } from "@/apis/apis";

import { countOccurrences } from "@/utils/codeUtils";

export function useFileExecute({
  backupHtmlFile,
  backupHtmlContent,
  textareas,
  setTextareas,
  countryCode,
  ticketUrl,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadedFileContent, setDownloadedFileContent] = useState("");
  const [downloadedFileName, setDownloadedFileName] = useState("");
  const [needToSaveTemplate, setNeedToSaveTemplate] = useState(false);

  const handleChangeResults = (changeResults) => {
    const updatedTextareas = textareas.map((textarea, index) => {
      const { changed, matchedPart } = changeResults.find((result) => result.pairIndex === index) || {};

      const lowerCaseCode = countryCode?.toLowerCase?.() || "";

      const normalizePath = (code) =>
        code?.replace(new RegExp(`/${lowerCaseCode}/`, "g"), "/uk/")?.trim();

      const asWasOccurrenceCount = countOccurrences(
        backupHtmlContent,
        textarea.asWasCode
      );
      const toBeOccurrenceCount = countOccurrences(
        downloadedFileContent,
        textarea.toBeCode.replace(
          /\/uk\//g,
          `/${lowerCaseCode}/`
        )
      );

      const normalizedAsWas = normalizePath(textarea.asWasCode);
      const normalizedToBe = normalizePath(textarea.toBeCode);

      const actualChanged = normalizedAsWas !== normalizedToBe;
      const isFound = asWasOccurrenceCount > 0;

      return {
        ...textarea,
        pptNo: textarea.pptNo,
        isApplied: isFound ? (actualChanged ? "yes" : "sameAsBefore") : "no",
        asWasOccurrenceCount,
        toBeOccurrenceCount,
        asWasCode: textarea.asWasCode.replace(
          /\/uk\//g,
          `/${lowerCaseCode}/`
        ),
        toBeCode: textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCode}/`),
        changed: isFound && actualChanged,
        matchedPart,
      };
    });

    setTextareas(updatedTextareas);
  };

  const handleConvertByCountryCode = async () => {
    const lowerCaseCode = countryCode?.toLowerCase?.() || "";

    const updatedTextareas = textareas.map((textarea) => ({
      ...textarea,
      pptNo: textarea.pptNo,
      asWasCode: textarea.asWasCode.replace(/\/uk\//g, `/${lowerCaseCode}/`),
      toBeCode: textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCode}/`),
      changed: textarea.asWasCode !== "",
    }));

    setTextareas(updatedTextareas);
    setIsExecuted(true);
    setUploadProgress(0);

    if (
      backupHtmlFile &&
      updatedTextareas.every(({ asWasCode, toBeCode }) => asWasCode && (toBeCode !== null || toBeCode === ""))
    ) {
      const formData = new FormData();
      formData.append("file", backupHtmlFile);

      const codeChanges = updatedTextareas
        .filter((textarea) => textarea.changed)
        .map((textarea) => ({
          asWasCode: textarea.asWasCode,
          toBeCode: textarea.toBeCode,
        }));
      formData.append("codeChanges", JSON.stringify(codeChanges));
      formData.append("ticket_url", String(ticketUrl));
      formData.append("countryCode", String(countryCode));

      try {
        const result = await convertAsWasToToBeCodes({
          formData,
          setIsProcessing,
          setUploadProgress,
        });

        if (result) {
          const { fileContent, filename, changeResults } = result;
          setDownloadedFileContent(fileContent);
          setDownloadedFileName(filename);
          setUploadStatus("success");

          setTextareas(updatedTextareas);
          handleChangeResults(changeResults);
        } else {
          setUploadStatus("fail");
        }
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

  // 코드 변환 다운로드
  const handleDownload = () => {
    const hasUnapplied = textareas.some(
      (textarea) => textarea.isApplied === "no"
    );

    if (hasUnapplied) {
      const proceed = window.confirm(
        "🚫 변환이 적용되지 않은 항목이 있습니다.\n그래도 다운로드 하시겠습니까?"
      );
      if (!proceed) return;
    }

    if (downloadedFileContent) {
      const blob = new Blob([downloadedFileContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadedFileName || "downloaded_file.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setNeedToSaveTemplate(true);
    } else {
      alert("변환된 파일이 없습니다. 먼저 코드 변환을 진행해주세요.");
    }
  };

  useEffect(() => {
    if (needToSaveTemplate) {
      setTimeout(() => {
        setNeedToSaveTemplate(false);
      }, 5000);
    }
  }, [needToSaveTemplate]);

  return {
    isProcessing,
    isExecuted,
    uploadProgress,
    uploadStatus,
    downloadedFileName,
    handleConvertByCountryCode,
    handleDownload,
  };
}
