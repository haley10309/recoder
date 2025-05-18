// import React, { useEffect, useState } from "react";
// import styled from "styled-components";
// import TicketInfoSelector from "@Components/LocalizationSetting/TicketInfoSelector";
// import FileUploadSection from "@Components/LocalizationSetting/FileUploadSection";
// import ActionButtons from "@Components/LocalizationSetting/ActionButtons";
// import CodeReviewTable from "@Components/LocalizationSetting/CodeReviewTable";
// import { useRecoilState, useRecoilValue } from "recoil";
// import {
//   textareasState,
//   countryCodeState,
//   ticketUrlState,
// } from "@/recoil/atoms/state";
// import { fetchTicketData } from "@/apis/apis";

// const LocalizationToolPage = () => {
//   const [ticketOptions, setTicketOptions] = useState([]);
//   const [textareas, setTextareas] = useRecoilState(textareasState);
//   const [codePairs, setCodePairs] = useState([]);
//   const [changeResults, setChangeResults] = useState([]);
//   const [htmlFile, setHtmlFile] = useState(null);
//   const [txtFile, setTxtFile] = useState(null);
//   const [fileContent, setFileContent] = useState("");
//   const [downloadedFileContent, setDownloadedFileContent] = useState("");
//   const [downloadedFileName, setDownloadedFileName] = useState("");
//   const [uploadStatus, setUploadStatus] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isExecuted, setIsExecuted] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [validCountries, setValidCountries] = useState([]);
//   const [translations, setTranslations] = useState({});
//   const [englishCopies, setEnglishCopies] = useState([]);
//   const [rows, setRows] = useState([]);

//   const countryCode = useRecoilValue(countryCodeState);
//   const ticketUrl = useRecoilValue(ticketUrlState);

//   useEffect(() => {
//     const fetchOptions = async () => {
//       try {
//         const data = await fetchTicketData("get-ticket-number");
//         setTicketOptions(data);
//       } catch (err) {
//         console.error("티켓 옵션 로딩 실패:", err);
//       }
//     };
//     fetchOptions();
//   }, []);

//   const handleConvert = () => {
//     const updatedRows = textareas.map((textarea, index) => {
//       const toBeMatch = textarea.asWasOccurrenceCount > 0;
//       return {
//         ppt_no: index + 1,
//         asWas: textarea.asWasCode,
//         toBe: textarea.toBeCode,
//         toBeMatch,
//         asWasOccurrenceCount: textarea.asWasOccurrenceCount,
//         toBeOccurrenceCount: textarea.toBeOccurrenceCount,
//         matchedPart: textarea.matchedPart,
//         localization: "",
//         localized: false,
//         completed: false,
//         showMatchedAsWas: false,
//         showMatchedLocal: false,
//       };
//     });
//     setRows(updatedRows);
//   };

//   const handleApplyLocalization = () => {
//     const updatedRows = rows.map((row) => {
//       const matchedLocal = translations[countryCode]?.find(
//         (local) => local.aswas_code === row.asWas
//       );
//       return {
//         ...row,
//         localization: matchedLocal?.code_context || "",
//         localized: !!matchedLocal,
//         completed: row.toBeMatch && !!matchedLocal,
//       };
//     });
//     setRows(updatedRows);
//   };

//   const handleDownload = () => {
//     if (!downloadedFileContent) {
//       alert("다운로드할 파일이 없습니다.");
//       return;
//     }
//     const blob = new Blob([downloadedFileContent], { type: "text/html" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = downloadedFileName || "converted_file.html";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   return (
//     <PageWrapper>
//       <TicketInfoSelector
//         ticketOptions={ticketOptions}
//         setTextareas={setTextareas}
//         setCodePairs={setCodePairs}
//       />
//       <FileUploadSection
//         textareas={textareas}
//         setTextareas={setTextareas}
//         setChangeResults={setChangeResults}
//         setHtmlFile={setHtmlFile}
//         setTxtFile={setTxtFile}
//         setFileContent={setFileContent}
//         setDownloadedFileContent={setDownloadedFileContent}
//         setDownloadedFileName={setDownloadedFileName}
//         setUploadStatus={setUploadStatus}
//         setIsProcessing={setIsProcessing}
//         setIsExecuted={setIsExecuted}
//         setUploadProgress={setUploadProgress}
//         setValidCountries={setValidCountries}
//         setTranslations={setTranslations}
//         setEnglishCopies={setEnglishCopies}
//       />
//       <ActionButtons
//         textareas={textareas}
//         setTextareas={setTextareas}
//         originalFile={htmlFile}
//         fileContent={fileContent}
//         ticketUrl={ticketUrl}
//         countryCode={countryCode}
//         setChangeResults={setChangeResults}
//         setDownloadedFileContent={setDownloadedFileContent}
//         setDownloadedFileName={setDownloadedFileName}
//         setUploadStatus={setUploadStatus}
//         setIsProcessing={setIsProcessing}
//         setIsExecuted={setIsExecuted}
//         setUploadProgress={setUploadProgress}
//         onConvert={handleConvert}
//         onApplyLocalization={handleApplyLocalization}
//         onDownload={handleDownload}
//       />
//       <CodeReviewTable rows={rows} />
//     </PageWrapper>
//   );
// };

// export default LocalizationToolPage;

// const PageWrapper = styled.div`
//   padding: 2rem;
//   background-color: #ffffff;
//   min-height: 100vh;
// `;
