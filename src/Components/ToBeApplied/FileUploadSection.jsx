// import React from "react";
// import styled from "styled-components";
// import FileUpload from "@/assets/shift-fill.svg";
// import HtmlFile from "@/assets/union.svg";

// const FileUploadSection = ({
//   htmlUploadStatus,
//   htmlFileName,
//   handleFileChange,
//   isEnglishCountry,
//   txtUploadStatus,
//   txtFileName,
//   handleTranslationUpload,
// }) => {
//   return (
//     <ConvertContainer>
//       {/* HTML 업로드 */}
//       <div>
//         {htmlUploadStatus ? (
//           <PreviewHeader style={{ marginTop: "0.75rem" }}>
//             <img src={HtmlFile} alt="htmlicon" />
//             <div id="preview-text">
//               <span>{htmlFileName}</span>
//               <ProgressBar>
//                 <ProgressFill $progress={100} />
//               </ProgressBar>
//               <UploadStatus $success={htmlUploadStatus === "success"}>
//                 {htmlUploadStatus === "success"
//                   ? "📂 HTML 파일 업로드 성공!"
//                   : "❌ HTML 파일 업로드 실패"}
//               </UploadStatus>
//             </div>
//           </PreviewHeader>
//         ) : (
//           <FileDropLabel htmlFor="dropzone-file">
//             <FileDropInner>
//               <img src={FileUpload} alt="Apply" />
//               <p>Backup HTML 을 업로드 해주세요.</p>
//             </FileDropInner>
//             <input
//               id="dropzone-file"
//               type="file"
//               onChange={handleFileChange}
//               hidden
//             />
//           </FileDropLabel>
//         )}
//       </div>

//       {/* TXT 업로드 */}
//       {!isEnglishCountry && (
//         <div>
//           {txtUploadStatus ? (
//             <PreviewHeader style={{ marginTop: "0.75rem" }}>
//               <img src={HtmlFile} alt="txticon" />
//               <div id="preview-text">
//                 <span>{txtFileName}</span>
//                 <ProgressBar>
//                   <ProgressFill $progress={100} />
//                 </ProgressBar>
//                 <UploadStatus $success={txtUploadStatus === "success"}>
//                   {txtUploadStatus === "success"
//                     ? "📄 번역덱 TXT 업로드 성공!"
//                     : "❌ 번역덱 TXT 업로드 실패"}
//                 </UploadStatus>
//               </div>
//             </PreviewHeader>
//           ) : (
//             <FileDropLabel htmlFor="dropzone-txt">
//               <FileDropInner>
//                 <img src={FileUpload} alt="Apply" />
//                 <p>번역덱 TXT 을 업로드 해주세요.</p>
//               </FileDropInner>
//               <input
//                 id="dropzone-txt"
//                 type="file"
//                 onChange={handleTranslationUpload}
//                 hidden
//               />
//             </FileDropLabel>
//           )}
//         </div>
//       )}
//     </ConvertContainer>
//   );
// };

// export default FileUploadSection;

// // styled-components는 기존 것을 재활용해서 사용하면 돼!
// const ConvertContainer = styled.div`
//   display: flex;
//   gap: 2rem;
// `;
// const PreviewHeader = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 12px;
//   #preview-text {
//     font-size: 0.875rem;
//     font-weight: 500;
//   }
//   img {
//     width: 1.875rem;
//     height: 1.875rem;
//   }
// `;
// const FileDropLabel = styled.label`
//   width: 20.625rem;
//   height: 7.6875rem;
//   border: 2px dashed #d1d5db;
//   border-radius: 0.5rem;
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
//   cursor: pointer;
// `;
// const FileDropInner = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   gap: 10px;
//   img {
//     width: 24px;
//     height: 24px;
//   }
//   p {
//     font-size: 14px;
//   }
// `;
// const ProgressBar = styled.div`
//   width: 11.25rem;
//   height: 0.125rem;
//   background-color: #e5e7eb;
//   border-radius: 999px;
//   margin-top: 8px;
// `;
// const ProgressFill = styled.div`
//   width: ${({ $progress }) => ($progress ? `${$progress}%` : "0%")};
//   height: 100%;
//   background: #5b975b;
//   border-radius: 999px;
// `;
// const UploadStatus = styled.div`
//   font-size: 12px;
//   margin-top: 4px;
//   color: ${({ $success }) => ($success ? "#009900" : "#ff0000")};
// `;
