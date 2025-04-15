import React, { useState  } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { kind_countOccurrences as countOccurrencesUtil } from "@/utils/codeUtils";
import AddIcon from "@mui/icons-material/Add";
import Frequency from "@Create_Template/Frequency";
import CheckTemplate from "./CheckTemplate";
import UploadFiles from "./UploadFiles";
import "@Create_Template/Create_Template.scss";

const Create_template = () => {
  const [asWasCodes, setAsWasCodes] = useState(["", "", ""]);
  const [toBeCodes, setToBeCodes] = useState(["", "", ""]);
  const [pptNos, setPptNos] = useState(["", "", ""]);
  const [asset_asWas, setAsset_asWas] = useState([]);
  const [asset_toBe, setAsset_toBe] = useState([]);
  const [asset_pptNo, setAsset_pptNo] = useState([]);
  const [templateID, setTemplateID] = useState("");
  const [projectName, setProjectName] = useState("");
  const [PDP, setPDP] = useState("");
  const [productName, setProductName] = useState("");
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [save_type, setSave_type] = useState("");

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

  const handleSave = async () => {
    const combinedPptNos = [...pptNos, ...asset_pptNo];
    const combinedAsWasCodes = [...asWasCodes, ...asset_asWas];
    const combinedToBeCodes = [...toBeCodes, ...asset_toBe];
  
    const aswasTobeList = combinedAsWasCodes.map((_, index) => ({
      ppt_no: combinedPptNos[index],
      aswas_code: combinedAsWasCodes[index],
      tobe_code: combinedToBeCodes[index],
    }));
  
    const formData = new FormData();
    formData.append("templateId",templateID);
    formData.append("hotfix_name", projectName);
    formData.append("pdp_name", PDP);
    formData.append("product", productName);
  
    const formattedDate = new Date().toISOString().split("T")[0];
    formData.append("create_date", formattedDate);
    formData.append("aswas_tobe_list", JSON.stringify(aswasTobeList));
  
    try {
      let response;
      if (save_type === "create") {
        response = await axios.post(`${BASE_URL}/create`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else if (save_type === "update") {
        response = await axios.post(
          `${BASE_URL}/update-template`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
  
      // console.log("Data sent successfully", aswasTobeList);
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
    if (!result.destination) return;

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

  const countOccurrences = (asWasCode) => {
    if (!fileContent) {
      return "";
    } else if (!asWasCode){
      return 0;
    }
    const occurrenceCount = countOccurrencesUtil(fileContent, asWasCode);
    return occurrenceCount !== "null" ? occurrenceCount : "0";
  };

  const allFieldsFilled = () => {
    return (
      asWasCodes.every((code) => code.trim() !== "") &&
      toBeCodes.every((code) => code.trim() !== "")&&
      asset_asWas.every((code) => code.trim() !== "")&&
      asset_toBe.every((code) => code.trim() !== "")
    );
  };

  return (
    <div className="bg-[#f7f7f7] px-40 py-20">
      <CheckTemplate setSave_type={setSave_type} setAsWasCodes={setAsWasCodes} setToBeCodes={setToBeCodes} setAsset_asWas={setAsset_asWas} setTemplateID={setTemplateID} setPptNos={setPptNos} setAsset_toBe={setAsset_toBe} setAsset_pptNo={setAsset_pptNo} setProjectName={setProjectName} setPDP={setPDP} setProductName={setProductName} projectName={projectName} PDP={PDP} productName={productName} />

      <UploadFiles file={file} asset_pptNo={asset_pptNo} asset_asWas={asset_asWas} setAsset_asWas={setAsset_asWas} asset_toBe={asset_toBe} setAsset_toBe={setAsset_toBe} addAssetArea={addAssetArea} setAsset_pptNo={setAsset_pptNo} fileContent={fileContent} setFile={setFile} setFileContent={setFileContent} setPptNos={setPptNos} setAsWasCodes={setAsWasCodes} setToBeCodes={setToBeCodes} />

      <div className="flex flex-col rounded-[10px] bg-white border border-gray-300 text-[#32383E] p-8">
        <h2 className="font-bold text-black mb-5 text-[16px]">AS-WAS / TO-BE 코드 입력</h2>
        <div>
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
                              <Frequency/>
                            {countOccurrences(asWasCodes[index])}
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
        </div>
        <div className="add_more_div">
          <button type="button" onClick={addTextArea} className="add_more_button">
            <AddIcon />
            <span className="add_button_text">항목 추가</span>
          </button>
        </div>
      </div>

      <div className="save_button_div">
        <button
          type="button"
          className="save_button"
          onClick={handleSave}
          disabled={!allFieldsFilled()}
        >
          {save_type === "update" && `수정`}
          {save_type === "create" && `생성`}
          {save_type !== "update" && save_type !== "create" && `저장`}
        </button>
      </div>
    </div>
  );
};

export default Create_template;
