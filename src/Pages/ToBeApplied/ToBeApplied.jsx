import { useState } from "react";
import axios from "axios";
import Process from "../../assets/uim_process.png";
import BasicTextarea from "../../Components/ToBeApplied/Textarea";
import SettingDropdown from "../../Components/ToBeApplied/SettingDropdown";
import Country_code from "../../Components/Template_detail_set/Country_code";
import NoValuePage from "./NoValuePage";

const ToBeApplied = () => {
  const [projectName, setProjectName] = useState("");
  const [pdp, setPdp] = useState("");
  const [productName, setProductName] = useState("");
  const [originalFile, setOriginalFile] = useState(null);
  const [textareas, setTextareas] = useState([{ asWasCode: null, toBeCode: null }]);
  const [downloadLink, setDownloadLink] = useState("");
  const [changeResults, setChangeResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [codePairs, setCodePairs] = useState([]);
  const [country_code, setCountry_code] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setOriginalFile(selectedFile);
      console.log("Selected file:", selectedFile);
    } else {
      console.warn("No file selected");
    }
  };

  const handleAsWasCodeChange = (index, value) => {
    const newTextareas = [...textareas];
    newTextareas[index].asWasCode = value;
    setTextareas(newTextareas);
  };

  const handleToBeCodeChange = (index, value) => {
    const newTextareas = [...textareas];
    newTextareas[index].toBeCode = value;
    setTextareas(newTextareas);
  };

  const handleDeleteTextarea = (index) => {
    const newTextareas = textareas.filter((_, i) => i !== index);
    setTextareas(newTextareas);
  };

  const handleChangeResults = (changeResults) => {
    changeResults.forEach(({ pairIndex, changed }) => {
      if (changed) {
        console.log(`Pair ${pairIndex} has been changed: ${changed}`);
      } else {
        console.log(`Pair ${pairIndex} was not changed: ${changed}`);
      }
    });
  };

  const handleSetting = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/search-setting",
        {
          hotfix_name: projectName,
          pdp_name: pdp,
          product: productName,
        }
      );

      if (response.data.success) {
        const pairs = response.data.codePairs;
        const newTextareas = pairs.map((pair) => ({
          asWasCode: pair.aswas_code,
          toBeCode: pair.tobe_code,
        }));

        setTextareas(newTextareas);
        setCodePairs(pairs);
        console.log("Code pairs:", pairs);
      } else {
        alert("해당 값이 존재하지 않습니다.");
      }
    } catch (error) {
      console.error("Error fetching code pairs:", error);
    }
  };

  const handleExecute = async () => {
    if (
      originalFile &&
      textareas.every(({ asWasCode, toBeCode }) => asWasCode && toBeCode)
    ) {
      const formData = new FormData();
      formData.append("file", originalFile);

      const codePairs = textareas.map((textarea) => {
        return {
          asWasCode: textarea.asWasCode.replace(
            /\/site\//g,
            `/${country_code}/`
          ), 
          toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`),
        };
      });

      
      formData.append("codePairs", JSON.stringify(codePairs)); 

      try {
        setIsProcessing(true);
        const response = await axios.post(
          `http://localhost:5000/api/process-file`,
          formData
        );

        const { downloadLink, changeResults } = response.data; 
        setChangeResults(changeResults); 
        handleChangeResults(changeResults); 

        if (downloadLink) {
          setDownloadLink(downloadLink); 
        }
      } catch (error) {
        console.error("Error processing file", error);
      } finally {
        setIsProcessing(false); 
      }
    } else {
      alert("파일 선택과 asWasCode와 toBeCode를 입력은 필수입니다."); 
    }
  };

  const handleDownload = async () => {
    if (!downloadLink) {
      console.warn("Download link is not set");
      return;
    }

    const formattedCountryCode = country_code.replace(/\s+/g, "_");
    const filename = `${formattedCountryCode}_changed_to-be.html`;

    try {
      const downloadResponse = await axios.get(downloadLink, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file", error);
    }
  };

  return (
    <>
      <div className="bg-white">
        <div className="flex gap-14 p-10 justify-between bg-white shadow-xl rounded-b-[20px]">
          <div className="flex w-full gap-14 justify-center items-center">
            <SettingDropdown
              _inputProps={{ placeholder: "S24" }}
              _title="프로젝트명"
              _onChange={() => {}}
              _value={projectName}
              _setValue={setProjectName}
              _url="projects"
            />
            <SettingDropdown
              _inputProps={{ placeholder: "Feature" }}
              _title="PDP"
              _onChange={() => {}}
              _value={pdp}
              _setValue={setPdp}
              _url="pdps"
            />
            <SettingDropdown
              _inputProps={{ placeholder: "B5" }}
              _title="Product Name"
              _onChange={() => {}}
              _value={productName}
              _setValue={setProductName}
              _url="products"
            />
              <Country_code
                country_code={country_code}
                setCountry_code={setCountry_code}
              />
          </div>
          <div className="flex justify-center items-center">
            <button
              className="bg-black text-white font-semibold text-[14px] rounded-[20px] w-[150px] shadow-xl h-[35px]"
              onClick={handleSetting}
            >
              세팅 가져오기
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-20 p-14">
          <div className="border-dashed border-black border-2 p-6 w-[300px]">
            <h1 className="font-bold pb-4">Original Code File</h1>
            <input
              className="file-input"
              type="file"
              onChange={handleFileChange}
            />
          </div>
          <button
            className="flex items-center justify-center gap-2 font-bold bg-[#00A3FF] h-[41px] w-[137px] text-white"
            onClick={handleExecute}
            disabled={isProcessing}
          >
            {isProcessing ? "실행 중 .." : "실행"}
            <img
              className="w-[19px] align-center"
              src={Process}
              alt="process"
            />
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

        <div className="bg-[#f6f6f6]">
          <div>
            {textareas && textareas.length > 0 ? (
              textareas.map((textarea, index) => (
                <BasicTextarea
                  key={index}
                  pptNo={codePairs[index]?.ppt_no}
                  asWasCode={textarea.asWasCode}
                  setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
                  toBeCode={textarea.toBeCode}
                  setToBeCode={(value) => handleToBeCodeChange(index, value)}
                  changed={{
                    index: index,
                    changed: changeResults[index]
                      ? changeResults[index].changed
                      : null,
                  }}
                  onDelete={() => handleDeleteTextarea(index)}
                />
              ))
            ) : (
              <div className="flex justify-center">
                <NoValuePage />
              </div>
            )}
            </div>
          </div>          
        </div>
    </>
  );
};

export default ToBeApplied;
