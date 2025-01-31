import React, { useEffect, useState } from "react";
import "./Create_Template.scss";
import Asset_Template from './Asset_template';
import Input_Project from "../../Components/Template_detail_set/Input_Project";
import Input_pdp from "../../Components/Template_detail_set/Input_pdp";
import Input_product_name from "../../Components/Template_detail_set/Input_product_name";
import Input_date from "../../Components/Template_detail_set/Input_date";
import BasicInput from "../../Components/ToBeApplied/Input";
import Alert from "@mui/material/Alert";

import { Dropdown } from "primereact/dropdown";
import AddIcon from "@mui/icons-material/Add";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import axios from "axios";
import SettingDropdown from "../../Components/ToBeApplied/SettingDropdown";
import Country_code from "../../Components/Template_detail_set/Country_code";
import { countOccurrences as countOccurrencesUtil } from "../utils/codeUtils";

const Create_template = () => {
  const [asWasCodes, setAsWasCodes] = useState(["", "", ""]);
  const [toBeCodes, setToBeCodes] = useState(["", "", ""]);
  const [pptNos, setPptNos] = useState(["", "", ""]);
  const [asset_asWas, setAsset_asWas] = useState([]);
  const [asset_toBe, setAsset_toBe] = useState([]);
  const [asset_pptNo, setAsset_pptNo] = useState([]);

  const [file, setFile] = useState(null); // State for the uploaded file
  const [fileContent, setFileContent] = useState(""); //original code file
  const [isTemplateAvailable, setIsTemplateAvailable] = useState(false); //템플릿을 사용할 수 있을 지에 여부
  const [save_type, setSave_type] = useState("");
  const initial_droppable_id = "as_was_to_be_row";//droppable id 초기 변수
  // HTML 관련 데이터

  //프로젝트 정보 (컴포넌트에서 가져옴)
  const [projectName, setProjectName] = useState("");
  const [PDP, setPDP] = useState("");
  const [productName, setProductName] = useState("");

  const handleAssetSave = () => {
    // You can handle the logic for saving asset data here
    console.log('Assets saved successfully.');
    // You can perform any additional actions like sending data to the server
  };

  const addTextArea = () => {
    setAsWasCodes([...asWasCodes, ""]);
    setToBeCodes([...toBeCodes, ""]);
    setPptNos([...pptNos, ""]);
  };
  const addAssetArea = () =>{
    setAsset_asWas((prev) => [...prev,""]);
    setAsset_toBe((prev) => [...prev,""] );
    setAsset_pptNo((prev) => [...prev,""]);
  }

  const removeTextArea = (index) => {
    setAsWasCodes(asWasCodes.filter((_, i) => i !== index));
    setToBeCodes(toBeCodes.filter((_, i) => i !== index));
    setPptNos(pptNos.filter((_, i) => i !== index));
  };
  const removeAssetArea = (index) => {
    setAsset_asWas(asset_asWas.filter((_, i) => i !== index));
    setAsset_toBe(asset_toBe.filter((_, i) => i !== index));
    setAsset_pptNo(asset_pptNo.filter((_, i) => i !== index));
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
        const detailsResponse = await axios.post(
          "http://localhost:5000/get-template-details",
          {
            projectName,
            PDP,
            productName,
          }
        );
        setPptNos([]);
        setAsWasCodes([]);
        setToBeCodes([]);
        setAsset_asWas([]);
        setAsset_toBe([]);
        setAsset_pptNo([]);
                
        // Update state with the fetched data
        const details = detailsResponse.data; // This is an array of objects
        // setPptNos(details.map((item) => item.ppt_no));
        // setAsWasCodes(details.map((item) => item.aswas_code));
        // setToBeCodes(details.map((item) => item.tobe_code));
        
        details.forEach(item => {
          // Add ppt_no to the state
        
          // setPptNos(details.map((item) => item.ppt_no));
          // setAsWasCodes(details.map((item) => item.aswas_code));
          // setToBeCodes(details.map((item) => item.tobe_code));
          // Check if aswas_code starts with "//"
          // if (item.aswas_code.trim().startsWith("//")) {
          //   setAsset_asWas(details.map((item) => item.aswas_code));
          //   setAsset_pptNo(details.map((item) => item.ppt_no));
          // } else {
          //   setAsWasCodes(details.map((item) => item.aswas_code));
          //   setPptNos(details.map((item) => item.ppt_no));
          // }
  
          // // Check if tobe_code starts with "//"
          // if (item.tobe_code.trim().startsWith("//")) {
          //   setAsset_toBe(details.map((item) => item.tobe_code));
            
          // } else {
          //   setToBeCodes(details.map((item) => item.tobe_code));
          // }
          if (item.aswas_code.trim().startsWith("//")) {
            setAsset_asWas(prev => [...prev, item.aswas_code]);
            setAsset_pptNo(prev => [...prev, item.ppt_no]);
          } else {
            setAsWasCodes(prev => [...prev, item.aswas_code]);
            setPptNos(prev => [...prev, item.ppt_no]);
          }
  
          // Check if tobe_code starts with "//"
          if (item.tobe_code.trim().startsWith("//")) {
            setAsset_toBe(prev => [...prev, item.tobe_code]);
          } else {
            setToBeCodes(prev => [...prev, item.tobe_code]);
          }
        });
      } else {
        alert("새로운 템플릿을 추가할 수 있습니다."); //새로운 템플릿 생성일 때, 모든 변수들을 초기화
        // setPptNos(initialPptNos);
        // setAsWasCodes(initialAsWasCodes);
        // setToBeCodes(initialToBeCodes);

        setSave_type("create");
      }
    } catch (error) {
      console.error("Error checking for existing templates:", error);
      alert("템플릿 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSave = async () => {
    // Combine the original and asset-related arrays
    const combinedPptNos = [...pptNos, ...asset_pptNo];
    const combinedAsWasCodes = [...asWasCodes, ...asset_asWas];
    const combinedToBeCodes = [...toBeCodes, ...asset_toBe];
  
    // Create a combined list of asWas and toBe codes
    const aswasTobeList = combinedAsWasCodes.map((_, index) => ({
      ppt_no: combinedPptNos[index],
      aswas_code: combinedAsWasCodes[index],
      tobe_code: combinedToBeCodes[index],
    }));
  
    // Create FormData object for multipart/form-data
    const formData = new FormData();
    formData.append("hotfix_name", projectName);
    formData.append("pdp_name", PDP);
    formData.append("product", productName);
  
    const formattedDate = new Date().toISOString().split("T")[0]; // Get current date as YYYY-MM-DD
    formData.append("create_date", formattedDate); // Use formatted date
    formData.append("aswas_tobe_list", JSON.stringify(aswasTobeList)); // Append the combined list
  
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
  
      console.log("Data sent successfully", aswasTobeList);
      alert("템플릿이 성공적으로 저장되었습니다");
    } catch (error) {
      console.error(
        "Error sending data",
        error.response ? error.response.data : error
      );
      alert("템플릿 저장 중 오류가 발생하였습니다");
    }
  };
  
  

  const onDragEnd = (result) => {
    if (!result.destination) return; // If dropped outside, do nothing

    const reorderArray = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    };

    setAsWasCodes((prev) => reorderArray(prev, result.source.index, result.destination.index));
    setToBeCodes((prev) => reorderArray(prev, result.source.index, result.destination.index));
    setPptNos((prev) => reorderArray(prev, result.source.index, result.destination.index));
  };
  
  const handleInputChange = (setter, index, value) => {
    setter((prev) => {
      const newArray = [...prev];
      newArray[index] = value;
      return newArray;
    });
  };

  // const countOccurrences = (asWasCode) => {
  //   if (!fileContent || !asWasCode) return "null";

  //   const normalizedAsWasCode = normalizeCode(asWasCode);
  //   const normalizedFileContent = normalizeCode(fileContent);

  //   let occurrenceCount = 0;
  //   let startIndex = 0;

  //   // Loop to find all occurrences of normalizedAsWasCode in normalizedFileContent
  //   while (
  //     (startIndex = normalizedFileContent.indexOf(
  //       normalizedAsWasCode,
  //       startIndex
  //     )) !== -1
  //   ) {
  //     occurrenceCount++;
  //     startIndex += normalizedAsWasCode.length; // Move index forward to find next occurrence
  //   }

  //   return occurrenceCount; // Return the total count of occurrences
  // };

  const countOccurrences = (asWasCode) => {
    if (!fileContent || !asWasCode) {
      return "Run Test를 통해 알아보세요"; // 파일 내용이나 asWasCode가 없을 때의 메시지
    }
  
    // countOccurrencesUtil을 호출하여 결과를 가져옵니다.
    const occurrenceCount = countOccurrencesUtil(fileContent, asWasCode);
    return occurrenceCount !== "null" ? occurrenceCount : "0"; // null이 아닌 경우에만 반환
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
  const handleProjectNameChange = (projectName) => {
    setProjectName(projectName);
  };
  const handlePdpChange = (PDP) => {
    setPDP(PDP);
  };
  const handleProductNameChange = (productName) => {
    setProductName(productName);
  };
  const handleAssetAsWasChange = (index, value) => {
    setAsset_asWas(prev => {
      const newAssetAsWas = [...prev];
      newAssetAsWas[index] = value;
      return newAssetAsWas;
    });
  };
  const handleAssetToBeChange = (index, value) => {
    setAsset_toBe(prev => {
      const newAssetToBe = [...prev];
      newAssetToBe[index] = value;
      return newAssetToBe;
    });
  };
  const handleAssetPptNoChange =(index, value) =>{
    setAsset_pptNo(prev => {
      const newAssetPptNo = [...prev];
      newAssetPptNo[index] = value;
      return newAssetPptNo;
    });
  }
  return (
    <div className="Create_Template">
      
   
      <div className="flex gap-14 p-10 justify-between bg-white shadow-xl rounded-b-[20px]">
          <div className="flex w-full gap-14 justify-center items-center">
          <BasicInput
              _inputProps={{ placeholder: "S24" }}
            _title={"프로젝트명"}
            _onChange={handleProjectNameChange}
            _value={projectName}
          />
           <BasicInput
            _inputProps={{ placeholder: "Features" }}
            _title={"PDP"}
            _onChange={handlePdpChange}
            _value={PDP}
          />
           <BasicInput
            _inputProps={{ placeholder: "B5" }}
            _title={"Product Name"}
            _onChange={handleProductNameChange}
            _value={productName}
          />
          </div>
          <div className="flex justify-center items-center">
            <button
              className="bg-black text-white font-semibold text-[14px] rounded-[20px] w-[150px] shadow-xl h-[35px]"
              onClick={checkForExistingTemplate}
            >
              템플릿 생성
            </button>
          </div>
        </div>
        <div className="content-div">
          

             
              <div className="Run_Test_File_Upload">
                {file ? (
                  <label htmlFor="file-upload" className="file-upload-label">
                    {file.name}
                  </label>
                ) : (
                  <label htmlFor="file-upload" className="file-upload-label">
                    
                  </label>
                )}

                <div className="Run_test_button">
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
                    Run Test
                  </button>
                  <Asset_Template 
                    asset_pptNo={asset_pptNo}
                    asset_asWas={asset_asWas} 
                    asset_toBe={asset_toBe} 

                    addAssetArea={addAssetArea} 
                    removeAssetArea={removeAssetArea}
                    isTemplateAvailable={isTemplateAvailable}
                    setAsset_asWas={handleAssetAsWasChange} // Pass down the handler
                    setAsset_toBe={handleAssetToBeChange}   // Pass down the handler
                    setAsset_pptNo={handleAssetPptNoChange}
                    fileContent={fileContent}
                    onSave={handleAssetSave} 
                  />
                </div>
              </div>
              <div className="title_as_to_div">
              <div className="Out_div"><h4 className="title_as">Out</h4></div>
              <div className="In_div"><h4 className="title_to">In</h4></div>
              
              
            </div>


             
              <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId={`droppable-${Math.random()}`}>
            {(provided) => (
              <ul className="as_was_to_be_row"{...provided.droppableProps} ref={provided.innerRef} >
                {asWasCodes.map((_, index) => (
                  <Draggable key={index.toString()} draggableId={`item-${index}`} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="as_was_to_be_div"
                      >
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
                          이 코드가 포함된 횟수: {countOccurrences(asWasCodes[index])}
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
                          삭제
                        </button>
                      </div>
                    )}
                  </Draggable>
                  
                  ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        <div className="add_more_div">
          <button type="button" onClick={addTextArea} className="add_more_button">
            <AddIcon />
            <span className="add_button_text">항목 추가</span>
          </button>
        </div>

        <div className="save_button_div">
          <button
            type="button"
            className="save_button"
            onClick={handleSave}
          >
            {save_type === "update" && `수정`}
            {save_type === "create" && `생성`}
            {save_type !== "update" && save_type !== "create" && `저장`}
          </button>
        </div>

     
        </div>
     
    </div>
  );
};

export default Create_template;
