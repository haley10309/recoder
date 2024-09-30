import React, { useState } from "react";
import "./Create_Template.scss";
import Input_Project from "../../Components/Template_detail_set/Input_Project";
import Input_pdp from "../../Components/Template_detail_set/Input_pdp";
import Input_product_name from "../../Components/Template_detail_set/Input_product_name";
import Input_date from "../../Components/Template_detail_set/Input_date";

import { Dropdown } from "primereact/dropdown";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const Create_template = () => {
  const [asWasCodes, setAsWasCodes] = useState(["", "", ""]);
  const [toBeCodes, setToBeCodes] = useState(["", "", ""]);
  const [pptNos, setPptNos] = useState(["", "", ""]);

  const [file, setFile] = useState(null); // State for the uploaded file
  const [fileContent, setFileContent] = useState(""); //original code file
  const [save_type, setSave_type] = useState("");

  // HTML 관련 데이터

  //프로젝트 정보 (컴포넌트에서 가져옴)
  const [projectName, setProjectName] = useState("");
  const [PDP, setPDP] = useState("");
  const [productName, setProductName] = useState("");
  const [createDate, setCreateDate] = useState(Date);

  const addTextArea = () => {
    setAsWasCodes([...asWasCodes, ""]);
    setToBeCodes([...toBeCodes, ""]);
    setPptNos([...pptNos, ""]);
    setCodeTypes([...codeTypes, "선택"]); // 빈 값 추가
  };

  const removeTextArea = (index) => {
    setAsWasCodes(asWasCodes.filter((_, i) => i !== index));
    setToBeCodes(toBeCodes.filter((_, i) => i !== index));
    setPptNos(pptNos.filter((_, i) => i !== index));
    setCodeTypes(codeTypes.filter((_, i) => i !== index)); // 코드 종류 제거
  };
  // Function to handle save button click
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]; // Get the first selected file
    setFile(selectedFile); // Store the selected file in state
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFileContent(event.target.result); // Store the file content in state
        console.log("File content read successfully:", event.target.result); // Debugging
      };
      reader.readAsText(selectedFile); // Read the file as text
    } else {
      console.log("No file selected"); // Debugging
    }
  };
  const checkForExistingTemplate = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/check-template",
        {
          projectName,
          PDP,
          productName,
        }
      );

      if (response.data.length > 0) {
        alert("이미 존재하는 템플릿이 있습니다.");
        setSave_type("update");
      } else {
        alert("새로운 템플릿을 추가할 수 있습니다.");
        setSave_type("create");
      }
    } catch (error) {
      console.error("Error checking for existing templates:", error);
      alert("템플릿 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSave = async () => {
    const aswasTobeList = [];

    // Construct aswasTobeList based on the current inputs
    asWasCodes.forEach((_, index) => {
      aswasTobeList.push({
        ppt_no: pptNos[index],
        aswas_code: asWasCodes[index],
        tobe_code: toBeCodes[index],
      });
    });

    // Create FormData object for multipart/form-data
    const formData = new FormData();
    formData.append("hotfix_name", projectName);
    formData.append("pdp_name", PDP);
    formData.append("product", productName);

    // Format createDate to YYYY-MM-DD
    const formattedDate = new Date().toISOString().split("T")[0]; // Get current date as YYYY-MM-DD
    formData.append("create_date", formattedDate); // Use formatted date
    formData.append("aswas_tobe_list", JSON.stringify(aswasTobeList));
    // if (file) {
    //   formData.append("file", file);
    // }

    try {
      let response;
      if (save_type === "create") {
        response = await axios.post("http://localhost:5000/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (save_type === "update") {
        response = await axios.post(
          "http://localhost:5000/update-template",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      console.log("Data sent successfully", response.data);
      alert("Template saved successfully.");
    } catch (error) {
      console.error(
        "Error sending data",
        error.response ? error.response.data : error
      );
      alert("An error occurred while saving the template.");
    }
  };

  const countOccurrences = (asWasCode) => {
    if (!fileContent || !asWasCode) return "null";

    const normalizedAsWasCode = normalizeCode(asWasCode);
    const normalizedFileContent = normalizeCode(fileContent);

    let occurrenceCount = 0;
    let startIndex = 0;

    // Loop to find all occurrences of normalizedAsWasCode in normalizedFileContent
    while (
      (startIndex = normalizedFileContent.indexOf(
        normalizedAsWasCode,
        startIndex
      )) !== -1
    ) {
      occurrenceCount++;
      startIndex += normalizedAsWasCode.length; // Move index forward to find next occurrence
    }

    return occurrenceCount; // Return the total count of occurrences
  };

  // Normalize function
  function normalizeCode(code) {
    return code.replace(/\s+/g, ""); // 모든 공백 및 줄바꿈 제거
  }
  const allFieldsFilled = () => {
    // Check if all asWasCodes and toBeCodes are filled
    return (
      asWasCodes.every((code) => code.trim() !== "") &&
      toBeCodes.every((code) => code.trim() !== "")
    );
  };

  // Replace function (for reference)
  function replaceCode(originalCode, asWasCode, toBeCode) {
    const normalizedOriginal = normalizeCode(originalCode);
    const normalizedAsWas = normalizeCode(asWasCode);

    const startIndex = normalizedOriginal.indexOf(normalizedAsWas);
    if (startIndex === -1) {
      console.log("일치하는 부분이 없습니다.");
      return originalCode;
    }

    let realStartIndex = -1;
    let realEndIndex = -1;
    for (let i = 0, j = 0; i < originalCode.length; i++) {
      if (/\s/.test(originalCode[i])) {
        continue;
      }
      if (j === startIndex && realStartIndex === -1) {
        realStartIndex = i;
      }
      if (j === startIndex + normalizedAsWas.length - 1) {
        realEndIndex = i;
        break;
      }
      j++;
    }

    if (realStartIndex === -1 || realEndIndex === -1) {
      console.log("일치하는 부분을 찾을 수 없습니다.");
      return originalCode;
    }

    const newCode =
      originalCode.slice(0, realStartIndex) +
      toBeCode +
      originalCode.slice(realEndIndex + 1);
    return newCode;
  }

  return (
    <div className="Create_Template">
      <div className="template_detail_box">
        <Input_Project
          projectName={projectName}
          setProjectName={setProjectName}
        />
        <Input_pdp PDP={PDP} setPDP={setPDP} />
        <Input_product_name
          productName={productName}
          setProductName={setProductName}
        />
        <button
          type="button"
          className="check_button"
          onClick={checkForExistingTemplate}
        >
          확인
        </button>
      </div>

      <div className="file-upload-section">
        <label htmlFor="file-upload" className="file-upload-label">
          Upload Original Code File Below
        </label>
        <div className="file-upload-input-container">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".js,.html,.css"
            className="file-upload-input"
          />
          <button
            type="button"
            className="file-upload-button"
            onClick={() => document.getElementById("file-upload").click()}
          >
            파일 업로드
          </button>
        </div>
      </div>

      <div className="title_as_to_div">
        <h4 className="title_as">As_Was Code</h4>
        <h4 className="title_to">To-be Code</h4>
      </div>

      <form>
        {asWasCodes.map((_, index) => (
          <div key={index} className="as_was_to_be_div">
            <div className="num_type">
              <div className="ppt_no_col">
                <label className="ppt_no">PPT NO.</label>
                <input
                  type="text"
                  className="ppt_no_text"
                  value={pptNos[index]}
                  onChange={(e) => {
                    const newPptNos = [...pptNos];
                    newPptNos[index] = e.target.value;
                    setPptNos(newPptNos);
                  }}
                />
              </div>
            </div>

            <div className="as_was_div">
              <textarea
                id={`asWasCode${index}`}
                rows="5"
                value={asWasCodes[index]}
                onChange={(e) => {
                  const newCodes = [...asWasCodes];
                  newCodes[index] = e.target.value;
                  setAsWasCodes(newCodes);
                }}
                placeholder="Enter the as-was code here"
                className="code-textarea"
              />
              <div className="duplicate-count">
                중복 횟수: {countOccurrences(asWasCodes[index])}
              </div>
            </div>

            <div className="to_be_div">
              <textarea
                id={`toBeCode${index}`}
                rows="5"
                value={toBeCodes[index]}
                onChange={(e) => {
                  const newCodes = [...toBeCodes];
                  newCodes[index] = e.target.value;
                  setToBeCodes(newCodes);
                }}
                placeholder="Enter the to-be code here"
                className="code-textarea"
              />
            </div>
            <button
              type="button"
              onClick={() => removeTextArea(index)}
              className="remove_button"
            >
              열 삭제
            </button>
          </div>
        ))}

        <div className="add_more_div">
          <button
            type="button"
            onClick={addTextArea}
            className="add_more_button"
          >
            <AddIcon />
            <h8 className="add_button_text">항목 추가</h8>
          </button>
        </div>
        <div className="save_button_div">
          <button
            type="button"
            className="save_button"
            onClick={handleSave}
            disabled={!allFieldsFilled()}
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default Create_template;
