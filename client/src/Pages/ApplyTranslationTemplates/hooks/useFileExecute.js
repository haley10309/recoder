import { useState } from "react";

import { convertAsWasToToBeCodes } from "@/apis/apis";
import { countOccurrences } from "@/utils/codeUtils";

export function useFileExecute({
  // originalFile,
  // fileContent,
  // textareas,
  // setTextareas,
  // countryCode,
  // ticketUrl,
}) {
  // const [isProcessing, setIsProcessing] = useState(false);
  // const [isExecuted, setIsExecuted] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState(0);
  // const [uploadStatus, setUploadStatus] = useState("");
  // const [downloadedFileContent, setDownloadedFileContent] = useState("");
  // const [downloadedFileName, setDownloadedFileName] = useState("");

  // const handleChangeResults = (changeResults) => {
  //   const updatedTextareas = textareas.map((textarea, index) => {
  //     const { changed, matchedPart } =
  //       changeResults.find((result) => result.pairIndex === index) || {};

  //     const lowerCaseCode = countryCode?.toLowerCase?.() || "";

  //     const normalizePath = (code) =>
  //       code?.replace(new RegExp(`/${lowerCaseCode}/`, "g"), "/uk/")?.trim();

  //     const asWasOccurrenceCount = countOccurrences(
  //       fileContent,
  //       textarea.asWasCode
  //     );
  //     const toBeOccurrenceCount = countOccurrences(
  //       downloadedFileContent,
  //       textarea.toBeCode
  //     );

  //     const normalizedAsWas = normalizePath(textarea.asWasCode);
  //     const normalizedToBe = normalizePath(textarea.toBeCode);

  //     const actualChanged = normalizedAsWas !== normalizedToBe;
  //     const isFound = asWasOccurrenceCount > 0;

  //     return {
  //       ...textarea,
  //       pptNo: textarea.pptNo,
  //       changed: isFound && actualChanged,
  //       isApplied: isFound ? (actualChanged ? "yes" : "no") : "no",
  //       matchedPart,
  //       asWasOccurrenceCount,
  //       toBeOccurrenceCount,
  //       asWasCode: textarea.asWasCode.replace(
  //         /\/uk\//g,
  //         `/${lowerCaseCode}/`
  //       ),
  //       toBeCode: textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCode}/`),
  //     };
  //   });

  //   setTextareas(updatedTextareas);
  // };

  // 코드 출현 횟수 확인하기
  // const handleConvertByCountryCode = async () => {
  //   const lowerCaseCode = countryCode?.toLowerCase?.() || "";

  //   const updatedTextareas = textareas.map((textarea) => ({
  //     ...textarea,
  //     pptNo: textarea.pptNo,
  //     asWasCode: textarea.asWasCode.replace(/\/uk\//g, `/${lowerCaseCode}/`),
  //     toBeCode: textarea.toBeCode.replace(/\/uk\//g, `/${lowerCaseCode}/`),
  //     changed: textarea.asWasCode !== "",
  //   }));

  //   setTextareas(updatedTextareas);
  //   setIsExecuted(true);
  //   setUploadProgress(0);

  //   if (
  //     originalFile &&
  //     updatedTextareas.every(({ asWasCode, toBeCode }) => asWasCode && (toBeCode !== null || toBeCode === ""))
  //   ) {
  //     const formData = new FormData();
  //     formData.append("file", originalFile);

  //     const codeChanges = updatedTextareas
  //       .filter((textarea) => textarea.changed)
  //       .map((textarea) => ({
  //         asWasCode: textarea.asWasCode,
  //         toBeCode: textarea.toBeCode,
  //       }));
  //     formData.append("codeChanges", JSON.stringify(codeChanges));
  //     formData.append("ticket_url", String(ticketUrl));
  //     formData.append("countryCode", String(countryCode));

  //     try { 
  //       const result = await convertAsWasToToBeCodes({
  //         formData,
  //         setIsProcessing,
  //         setUploadProgress,
  //       });

  //       if (result) {
  //         const { fileContent, filename, changeResults } = result;
  //         setDownloadedFileContent(fileContent);
  //         setDownloadedFileName(filename);
  //         setUploadStatus("success");
          
  //         setTextareas(updatedTextareas);
  //         handleChangeResults(changeResults);
  //       } else {
  //         setUploadStatus("fail");
  //       }
  //     } catch (error) {
  //       console.error("파일 실행 오류", error);
  //       setUploadStatus("fail");
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   } else {
  //     alert("파일 선택, asWasCode, toBeCode 입력은 필수입니다.");
  //   }
  // };

  return {
    // isExecuted,
    // uploadProgress,
    // uploadStatus,
  };
}
