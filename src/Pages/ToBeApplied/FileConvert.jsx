import { useState } from "react";
import Process from "../../assets/uim_process.png";
import FileUpload from "../../assets/file_upload.png";
import { downloadFile, fileExecute, processFileForDownload } from "../../apis/apis";
import { useRecoilState } from "recoil";
import { countryCodeState, productNameState } from "../../recoil/atoms/state";

const FileConvert = ({ textareas, setTextareas }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [originalFile, setOriginalFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isExecuted, setIsExecuted] = useState(false);
  const [changeResults, setChangeResults] = useState([]);
  const [productName, setProductName] = useRecoilState(productNameState);
  const [country_code, setCountry_code] = useRecoilState(countryCodeState);

  const [image, setImage] = useState(null);

  // 파일 업로드와 다운로드 각각의 진행 상태
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0); 
  const [downloadStatus, setDownloadStatus] = useState("");


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    if (selectedFile) {
      setOriginalFile(selectedFile);
      setFileName(selectedFile.name);
      // console.log("Selected file:", selectedFile);
    } else {
      console.warn("No file selected");
    }
  };


  const checkAsWasCodeInOriginalFile = (asWasCode) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        resolve(fileContent.includes(asWasCode));
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(originalFile);
    });
  };

  const handleChangeResults = (changeResults) => {
    const updatedTextareas = textareas.map((textarea, index) => {
      const { changed, matchedPart } = changeResults.find(
        (result) => result.pairIndex === index
      ) || {};

      const isAsWasCodeExist = checkAsWasCodeInOriginalFile(textarea.asWasCode);

      if (isAsWasCodeExist) {
        return {
          ...textarea,
          changed: changed || false,
          isApplied: changed ? "yes" : "no",
          matchedPart: matchedPart,
          asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${country_code}/`),
          toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`),
        };
      } else {
        return {
          ...textarea,
          changed: false,
          isApplied: "no",
        };
      }
    });

    setTextareas(updatedTextareas);
  };

  const updateTextareasWithResults = (updatedTextareas, changeResults) => {
    const updatedTextareasWithMatch = updatedTextareas.map((textarea, index) => {
      const matchedResult = changeResults.find(
        (result) => result.pairIndex === index
      );
      const matchedPart = matchedResult ? matchedResult.matchedPart : "";

      return {
        ...textarea,
        matchedPart,
      };
    });

    setTextareas(updatedTextareasWithMatch);
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

    if (originalFile && updatedTextareas.every(({ asWasCode, toBeCode }) => asWasCode && toBeCode)) {
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

      // 파일 업로드를 위한 가상 처리
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setUploadStatus("success");
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      setTimeout(() => {
        fileExecute(setChangeResults, setDownloadLink, handleChangeResults, setIsProcessing, formData, updatedTextareas, setTextareas, codePairs, updateTextareasWithResults);
      }, 3000);

    // 실패 시
    setTimeout(() => {
      if (uploadProgress < 100) {
        setUploadStatus("fail");
        setIsProcessing(false);
      }
    }, 3500);
    } else {
      alert("파일 선택, asWasCode과 toBeCode 입력은 필수입니다.");
    }
  };

  const handleDownload = async () => {
    if (!downloadLink) {
      console.warn("Download link is not set");
      return;
    }

    const checkedCodePairs = textareas
      .filter((textarea) => textarea.checked)
      .map((textarea) => ({
        asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${country_code}/`),
        toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`),
      }));

    if (checkedCodePairs.length === 0) {
      console.warn("No checked code pairs to download");
      return;
    }

    const formData = new FormData();
    formData.append("file", originalFile);
    formData.append("codePairs", JSON.stringify(checkedCodePairs));

    try {
      setIsProcessing(true);

      // 다운로드 진행 상태 업데이트
      const downloadProgressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(downloadProgressInterval);
            setDownloadStatus("success");
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      const { downloadLink, changeResults } = await processFileForDownload(formData);

      setChangeResults(changeResults);
      await handleChangeResults(changeResults);

      if (downloadLink) {
        setDownloadLink(downloadLink);
      }

      await downloadFile(downloadLink, country_code, productName);
    } catch (error) {
      console.error("Error in download process", error);
    } finally {
      // setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-start rounded-[10px] p-8 bg-white border border-gray-300 text-[#32383E] my-14">
        <h2 className="font-bold text-black mb-3 text-[16px]">Back-Up 파일 불러오기</h2>
          <div className="flex flex-col items-center justify-center w-full">
            {fileName === ""? (
              <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-14 h-14 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click하여 </span>파일을 업로드하세요.</p>
                      <p className="text-xs text-gray-500">Original Code File (HTML)</p>
                  </div>
                  <input id="dropzone-file" type="file" onChange={handleFileChange} class="hidden" />
                  <button className="flex items-center justify-center gap-2 font-bold bg-gray-300 h-[41px] w-[137px] text-white rounded-[10px]" onClick={handleExecute} disabled>
                    {isProcessing ? "코드 변환 중 .." : "코드 변환"}
                    <img className="w-[19px] align-center" src={Process} alt="process" />
                  </button>
                </label>
            </div>
            
          ):(
            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex flex-col items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-14 h-14 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-[14px] text-gray-500"><span className="font-semibold">Click하여 </span>파일을 업로드하세요.</p>
                        <p className="text-[14px] text-gray-500">Original Code File (HTML)</p>
                    </div>
                    <input id="dropzone-file" type="file" onChange={handleFileChange} class="hidden" />
                    <button className="flex items-center justify-center gap-2 font-bold bg-white border-2 border-[#00A3FF] h-[41px] w-[137px] text-[#00A3FF] rounded-[10px]" onClick={handleExecute} disabled={isProcessing}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>

                      {isProcessing ? "코드 변환 중 .." : "코드 변환"}
                  </button>
                </label>
              </div>
              <div className="flex items-center justify-center w-[80%] py-10 border-2 border-gray-300 border rounded-lg bg-[#EBF8FF]">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-16">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
                </svg>
                <div className="w-[80%]">
                <p className="text-[14px] font-medium text-[#32383E]">{fileName}</p>
                   {/* Progress Bar */}
                {isProcessing && (
                  <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                )}

                {/* Status Message */}
                {uploadStatus && (
                  <div className="text-center mt-2 text-sm text-gray-600">
                    {uploadStatus === "success" ? "Success" : uploadStatus === "fail" ? "x" : ""}
                  </div>
                )}
                </div>
              </div>
            </div>
          )}
            </div>

        {downloadLink === "" ? (
             <></>
            ) : (
              <div className="flex flex-col items-center justify-center w-[80%] h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                 {/* 다운로드 진행 상태 */}
                 {isProcessing && (
                  <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${downloadProgress}%` }}></div>
                  </div>
                )}

                {/* Status Message */}
                {downloadStatus && (
                  <div className="text-center mt-2 text-sm text-gray-600">
                    {downloadStatus === "success" ? "Download Success" : downloadStatus === "fail" ? "Download Failed" : ""}
                  </div>
                )}
              <button
                onClick={handleDownload}
                className="flex justify-center items-center align-center bg-black w-[130px] h-[27px] text-center text-white rounded"
                disabled={isProcessing}
              >
                {isProcessing ? "파일 생성 중" :"파일 다운로드"}
              </button>
              </div>
            )}
        </div>
    
    </>
  );
};

export default FileConvert;
