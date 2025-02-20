import { useState } from "react";
import Process from "../../assets/uim_process.png";
import { downloadFile, fileExecute, processFileForDownload } from "../../apis/apis";
import { useRecoilState } from "recoil";
import { countryCodeState, productNameState } from "../../recoil/atoms/state";

const FileConvert = ({ textareas, setTextareas }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");
  const [originalFile, setOriginalFile] = useState(null);
  const [isExecuted, setIsExecuted] = useState(false);
  const [changeResults, setChangeResults] = useState([]);
  const [productName, setProductName] = useRecoilState(productNameState);
  const [country_code, setCountry_code] = useRecoilState(countryCodeState);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setOriginalFile(selectedFile);
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

      fileExecute(setChangeResults, setDownloadLink, handleChangeResults, setIsProcessing, formData, updatedTextareas, setTextareas, codePairs, updateTextareasWithResults);
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
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center gap-20 p-14">
        <div className="border-dashed border-black border-2 p-6 w-[300px]">
          <h1 className="font-bold pb-4">Original Code File</h1>
          <input className="file-input" type="file" onChange={handleFileChange} />
        </div>
        <button
          className="flex items-center justify-center gap-2 font-bold bg-[#00A3FF] h-[41px] w-[137px] text-white"
          onClick={handleExecute}
          disabled={isProcessing}
        >
          {isProcessing ? "코드 변환 중 .." : "코드 변환"}
          <img className="w-[19px] align-center" src={Process} alt="process" />
        </button>
        <div className="border-dashed border-black border-2 p-6 w-[300px]">
          <h1 className="font-bold pb-4">Changed Code File</h1>
          {downloadLink === "" ? (
            <div className="flex justify-center items-center align-center bg-gray-200 w-[130px] h-[27px] text-center text-white rounded">
              파일 다운로드
            </div>
          ) : (
            <button
              onClick={handleDownload}
              className="flex justify-center items-center align-center bg-black w-[130px] h-[27px] text-center text-white rounded"
            >
              파일 다운로드
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FileConvert;
