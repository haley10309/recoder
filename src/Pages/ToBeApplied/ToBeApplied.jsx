import { useState } from "react";
import axios from "axios";
import Process from "../../assets/uim_process.png";
import BasicTextarea from "../../Components/ToBeApplied/Textarea";
import SettingDropdown from "../../Components/ToBeApplied/SettingDropdown";
import Country_code from "../../Components/ToBeApplied/CountryCode";
import NoValuePage from "./NoValuePage";

const ToBeApplied = () => {
  const [projectName, setProjectName] = useState("");
  const [pdp, setPdp] = useState("");
  const [productName, setProductName] = useState("");
  const [originalFile, setOriginalFile] = useState(null);
  const [textareas, setTextareas] = useState([
    { asWasCode: "", toBeCode: "", checked: false, isApplied: null }
  ]);
  const [downloadLink, setDownloadLink] = useState("");
  const [changeResults, setChangeResults] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [codePairs, setCodePairs] = useState([]);
  const [country_code, setCountry_code] = useState("");
  const [filter, setFilter] = useState("all");
  const [isExecuted, setIsExecuted] = useState(false); 

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

  const handleChangeResults = (changeResults) => {
    const updatedTextareas = [...textareas];
  
    changeResults.forEach(({ pairIndex, changed }) => {
      const isAsWasCodeExist = checkAsWasCodeInOriginalFile(updatedTextareas[pairIndex].asWasCode);
  
      if (isAsWasCodeExist) {
        updatedTextareas[pairIndex].changed = changed; 
        updatedTextareas[pairIndex].isApplied = changed ? 'yes' : 'no';

        updatedTextareas[pairIndex].asWasCode = updatedTextareas[pairIndex].asWasCode.replace(/\/site\//g, `/${country_code}/`);
        updatedTextareas[pairIndex].toBeCode = updatedTextareas[pairIndex].toBeCode.replace(/\/site\//g, `/${country_code}/`);
      } else {
        updatedTextareas[pairIndex].changed = false;
        updatedTextareas[pairIndex].isApplied = 'no';
      }
    });
  
    setTextareas(updatedTextareas);
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
  

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  
  const handleCheckedChange = (index) => {
    const newTextareas = [...textareas];
    newTextareas[index].checked = !newTextareas[index].checked;
    setTextareas(newTextareas);
  };
  
  const filteredTextareas = () => {
    if (filter === "checked") {
      return textareas.filter((textarea) => textarea.checked);
    } else if (filter === "unchecked") {
      return textareas.filter((textarea) => !textarea.checked);
    }
    return textareas;
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
          checked:true
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
    const updatedTextareas = textareas.map((textarea) => {
      return {
        ...textarea,
        asWasCode: textarea.asWasCode.replace(/\/site\//g, `/${country_code}/`),
        toBeCode: textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`),
        changed: textarea.asWasCode !== "" && textarea.toBeCode !== "",
      };
    });
  
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
  
      try {
        setIsProcessing(true);
        const response = await axios.post("http://localhost:5000/api/process-file", formData);
        const { downloadLink, changeResults } = response.data;
  
        setChangeResults(changeResults);
        await handleChangeResults(changeResults);
  
        if (codePairs.length > 0) {
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
  
      const response = await axios.post("http://localhost:5000/api/process-file", formData);
      const { downloadLink, changeResults } = response.data;
  
      setChangeResults(changeResults);
      await handleChangeResults(changeResults);
  
      if (downloadLink) {
        setDownloadLink(downloadLink);
      }
  
      const downloadResponse = await axios.get(downloadLink, {
        responseType: "blob",
      });
  
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement("a");
      link.href = url;
      const today = new Date();
      const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, "").slice(2);
      const formattedCountryCode = country_code.replace(/\s+/g, "_");
      const filename = `${formattedCountryCode}_to-be_${formattedDate}.html`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error processing and downloading file", error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  
  return (
    <>
      <div className="bg-white mx-60">
        <h1 className="font-bold text-black my-10 text-[30px]">HOTFIX TO-BE 적용 페이지</h1>
        <div className="flex p-10 bg-white rounded-[20px] ring-2 ring-black">
          <div className="flex w-full justify-center items-center gap-0">
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
              className="bg-[#009900] text-white font-semibold text-[14px] rounded-[10px] w-[120px] h-[40px]"
              onClick={handleSetting}
            >
              불러오기
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
            {isProcessing ? "코드 변환 중 .." : "코드 변환"}
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
        
        <div className="bg-[#f6f6f6] mb-20">
          <div className="flex justify-between p-4 bg-[#495057] text-white border-b border-gray-300">
            <select onChange={handleFilterChange} value={filter} className="w-[12.5%] border border-gray-300 rounded px-4 text-black h-10 text-center">
              <option value="all">전체 항목</option>
              <option value="checked">체크된 항목</option>
              <option value="unchecked">체크되지 않은 항목</option>
            </select>
            <h1 className="w-[12.5%] flex items-center justify-center text-[14px] font-[500]">PPT NO.</h1>
            <h1 className="w-[28%] flex items-center justify-center text-[14px] font-[500]">As-Was Code</h1>
            <h1 className="w-[28%] flex items-center justify-center text-[14px] font-[500]">To-Be Code</h1>
            <h1 className="w-[18.75%] flex items-center justify-center text-[14px] font-[500]">To-Be 적용 여부</h1>
          </div>

          {filteredTextareas().length > 0 ? (
            filteredTextareas().map((textarea, index) => {
              const matchedPptNo = codePairs.find(pair => pair.aswas_code === textarea.asWasCode)?.ppt_no;

              return (
                <BasicTextarea
                  key={index}
                  pptNo={matchedPptNo}
                  asWasCode={textarea.asWasCode.replace(/\/site\//g, `/${country_code}/`)}
                  setAsWasCode={(value) => handleAsWasCodeChange(index, value)}
                  toBeCode={textarea.toBeCode.replace(/\/site\//g, `/${country_code}/`)}
                  setToBeCode={(value) => handleToBeCodeChange(index, value)}
                  changed={{
                    index: index,
                    changed: textarea.changed,
                  }}
                  isApplied={textarea.isApplied} 
                  onCheckedChange={() => handleCheckedChange(index)}
                  checked={textarea.checked}
                  filter={filter}
                  country_code={country_code}
                />
              );
            })
          ) : (
            <div className="flex justify-center">
              <NoValuePage />
            </div>
          )}
            </div>
          </div>
    </>
  );
};

export default ToBeApplied;