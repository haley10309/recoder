import { useState } from "react";
import { countOccurrences } from "@/utils/codeUtils";
import Process from "@/assets/uim_process.png";
import FileUpload from "@/assets/file_upload.png";
import HtmlFile from "@/assets/html_file.svg";
import { fileExecute } from "@/apis/apis";
import { useRecoilState } from "recoil";
import { countryCodeState, productNameState } from "@/recoil/atoms/state";

const FileConvert = ({ textareas, setTextareas }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isExecuted, setIsExecuted] = useState(false);
  const [changeResults, setChangeResults] = useState([]);
  const [productName, setProductName] = useRecoilState(productNameState);
  const [country_code, setCountry_code] = useRecoilState(countryCodeState);
  const [fileContent, setFileContent] = useState("");
  const [downloadedFileContent, setDownloadedFileContent] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isDownloaded, setIsDownloaded] = useState(false); 
  const [downloadedFileName, setDownloadedFileName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result;
      setFileContent(content);
    };
    reader.readAsText(selectedFile);

    if (selectedFile) {
      setOriginalFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      console.warn("No file selected");
    }
  };

  const handleChangeResults = (changeResults) => {
    const updatedTextareas = textareas.map((textarea, index) => {
      const { changed, matchedPart } = changeResults.find(
        (result) => result.pairIndex === index
      ) || {};

      const asWasOccurrenceCount = countOccurrences(fileContent, textarea.asWasCode);
      const toBeOccurrenceCount = countOccurrences(downloadedFileContent, textarea.toBeCode);

      return {
        ...textarea,
        changed: changed || false,
        isApplied: changed ? "yes" : "no",
        matchedPart: matchedPart,
        asWasOccurrenceCount,
        toBeOccurrenceCount,
        asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${country_code}/`),
        toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`),
      };
    });

    setTextareas(updatedTextareas);
  };

  const handleExecute = async () => {
    const updatedTextareas = textareas.map((textarea) => ({
      ...textarea,
      asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${country_code}/`),
      toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`),
      changed: textarea.asWasCode !== "",
    }));
  
    setTextareas(updatedTextareas);
    setIsExecuted(true);
    setUploadProgress(0);
  
    if (originalFile && updatedTextareas.every(({ asWasCode, toBeCode }) => asWasCode && (toBeCode !== null || toBeCode === ""))) {
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
        const progressUpdatePromise = new Promise((resolve) => {
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
              if (prev >= 100) {
                clearInterval(progressInterval);
                resolve();
                return 100;
              }
              return prev + 10;
            });
          }, 100);
        });
  
        const {fileContent, filename} = await fileExecute(setChangeResults, handleChangeResults, setIsProcessing, formData, updatedTextareas, setTextareas, productName, country_code);
        
        setDownloadedFileContent(fileContent);
        setDownloadedFileName(filename);
  
        await progressUpdatePromise;
        setUploadStatus("success");
        setIsDownloaded(false); 
  
      } catch (error) {
        console.error("파일 실행 오류", error);
        setUploadStatus("fail");
      } finally {
        setIsProcessing(false);
      }
    } else {
      alert("파일 선택, asWasCode과 toBeCode 입력은 필수입니다.");
    }
  };
  
  const handleDownload = () => {
    if (downloadedFileContent) {
      const blob = new Blob([downloadedFileContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadedFileName || "downloaded_file.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("변환된 파일이 없습니다. 먼저 코드 변환을 진행해주세요.");
    }
  };
  
  return (
    <>
      <div className="flex flex-col justify-center items-start rounded-[10px] p-8 bg-white border border-gray-300 text-[#32383E] my-14 w-full">
        <h2 className="font-bold text-black mb-3 text-[16px]">Back-Up 파일 불러오기</h2>
        <div className="flex w-full gap-10 my-2">
            <div className="flex flex-col items-center justify-center w-[40%] gap-4">
              <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full py-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer text-gray-500 bg-gray-50 hover:text-[#00A3FF] hover:bg-[#EBF8FF]">
                  <div className="flex flex-col items-center justify-center">
                    <img
                      className="w-[50px] h-[52px] mb-4"
                      src={FileUpload}
                      alt="Apply"
                    />
                    <p className="mx-10 my-2 text-[14px] "><span className="font-semibold">Click하여 </span>파일을 업로드하세요.</p>
                    <p className="text-[12px]">Original Code File (HTML)</p>
                  </div>
                  <input id="dropzone-file" type="file" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <div>
                 {fileName === "" ? (
                    <button className="flex items-center justify-center gap-2 font-bold bg-gray-300 h-[41px] w-[137px] text-white rounded-[10px]" onClick={handleExecute} disabled>
                      {isProcessing ? "코드 변환 중 .." : "코드 변환"}
                      <img className="w-[19px] align-center" src={Process} alt="process" />
                    </button>
                    ):( 
                    <button className="flex items-center justify-center gap-2 font-bold bg-white border-2 border-[#00A3FF] h-[41px] w-[137px] text-[#00A3FF] rounded-[10px]" onClick={handleExecute} disabled={isProcessing}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      {isProcessing ? "코드 변환 중 .." : "코드 변환"}
                    </button>
                  )}
              </div>
            </div>
            <div className="flex w-[60%]">
              {fileName === "" ? null : (
                <div className="flex items-center justify-center w-full py-10 rounded-lg">
                  <div className="w-full flex justify-center gap-10">
                    <div className="w-[70%] px-10">
                      <div className="flex w-full gap-4 justify-start items-center">
                        <img
                          className="w-[40px]"
                          src={HtmlFile}
                          alt="htmlicon"
                        />
                        <p className="text-[14px] font-bold text-[#32383E]">{fileName}</p>
                      </div>
                        {isProcessing && uploadProgress < 100 ? (
                          <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        ):(
                          <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5" />
                        )}

                        {uploadStatus && (
                          <div className={`text-center mt-2 text-[12px] ${uploadStatus === 'success' ? "text-[#009900]" : "text-[#ff0000]"}`}>
                            {uploadStatus === "success" ? "성공적으로 파일이 생성되었습니다 !" : uploadStatus === "fail" ? "파일 생성에 실패하였습니다." : ""}
                          </div>
                        )}

                        {isExecuted && (
                          <div className="mt-6 flex justify-center w-full">
                            <button
                              onClick={handleDownload}
                              className="flex items-center justify-center gap-2 font-bold bg-[#00A3FF] h-[41px] w-[160px] text-white rounded-[10px]"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9l-9 9-9-9" />
                              </svg>
                              파일 다운로드
                            </button>
                          </div>
                        )}
                        
                    </div>
                  </div>
                </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
};

export default FileConvert;
