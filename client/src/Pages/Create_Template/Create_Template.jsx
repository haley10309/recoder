import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { kind_countOccurrences } from "@/utils/codeUtils";
import AddIcon from "@mui/icons-material/Add";
import Frequency from "@Create_Template/Frequency";
import CheckTemplate from "./CheckTemplate";
import UploadFiles from "./UploadFiles";
import Asset_Template from "./Asset_template";
import "@Create_Template/Create_Template.scss";
import TransBox from "../../Components/Common/TransBox";
import TransFileUpload from "./TransFileUpload";
import CopyTextButton from "@/Components/Common/CopyTextButton";

const Create_template = () => {
  const [ticketNum, setTicketNum] = useState("");
  const [ticketURL, setTicketURL] = useState("");

  // non-asset states
  const [nonAssetAsWasCodes, setNonAssetAsWasCodes] = useState(["", "", ""]);
  const [nonAssetToBeCodes, setNonAssetToBeCodes] = useState(["", "", ""]);
  const [nonAssetPptNos, setNonAssetPptNos] = useState(["", "", ""]);

  // asset states
  const [assetAsWasCodes, setAssetAsWasCodes] = useState([]);
  const [assetToBeCodes, setAssetToBeCodes] = useState([]);
  const [assetPptNos, setAssetPptNos] = useState([]);

  // Template and ticket info
  const [templateID, setTemplateID] = useState("");
  const isTemplateAvailable = Boolean(templateID);

  // File upload and content
  const [fileContent, setFileContent] = useState("");

  // Save flags
  const [saveType, setSaveType] = useState(""); // 'create' | 'update'
  const [isTemplateCreated, setIsTemplateCreated] = useState(false); // 템플릿이 이미 만들어져 있으면 true로

  // Localization states
  const [englishCopy, setEnglishCopy] = useState([]);
  const [tobeCodeList, setTobeCodeList] = useState([]);

  const [localizedItems, setLocalizedItems] = useState([{ local_code: "" }, { local_code: "" }]);
  const [deleteIds, setDeleteIds] = useState([]);

  // tobe-code-list API call
  useEffect(() => {
    if (englishCopy.length && ticketNum && ticketURL) {
      axios
        .post(`${BASE_URL}/localization/tobe-code-list`, {
          ticket_num: ticketNum,
          ticket_url: ticketURL,
        })
        .then((res) => setTobeCodeList(res.data.tobe_code_list || []))
        .catch((err) => console.error(err));
    }
  }, [englishCopy, ticketNum, ticketURL]);

  // map to localizedItems
  useEffect(() => {
    if (englishCopy.length) {
      const items = tobeCodeList.filter((item) => englishCopy.some((orig) => item.tobe_code.includes(orig))).map((item) => ({ id: item.id, local_code: item.tobe_code }));
      if (items.length) setLocalizedItems(items);
    }
  }, [tobeCodeList, englishCopy]);

  // add/remove handlers
  const addTextArea = () => {
    setNonAssetPptNos((prev) => [...prev, ""]);
    setNonAssetAsWasCodes((prev) => [...prev, ""]);
    setNonAssetToBeCodes((prev) => [...prev, ""]);
  };
  const removeTextArea = (idx) => {
    setNonAssetPptNos((prev) => prev.filter((_, i) => i !== idx));
    setNonAssetAsWasCodes((prev) => prev.filter((_, i) => i !== idx));
    setNonAssetToBeCodes((prev) => prev.filter((_, i) => i !== idx));
  };
  const addAssetArea = () => {
    setAssetPptNos((prev) => [...prev, ""]);
    setAssetAsWasCodes((prev) => [...prev, ""]);
    setAssetToBeCodes((prev) => [...prev, ""]);
  };

  // Asset handlers
  const removeAssetArea = (i) => {
    setAssetAsWasCodes((prev) => prev.filter((_, idx) => idx !== i));
    setAssetToBeCodes((prev) => prev.filter((_, idx) => idx !== i));
    setAssetPptNos((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleAssetAsWasChange = (i, v) =>
    setAssetAsWasCodes((prev) => {
      const a = [...prev];
      a[i] = v;
      return a;
    });
  const handleAssetToBeChange = (i, v) =>
    setAssetToBeCodes((prev) => {
      const a = [...prev];
      a[i] = v;
      return a;
    });
  const handleAssetPptNoChange = (i, v) =>
    setAssetPptNos((prev) => {
      const a = [...prev];
      a[i] = v;
      return a;
    });

  // 핫픽스 템플릿 저장
  const handleSave = async () => {
    // AS-WAS/TO-BE validation: 동시에 비어있는 row 차단
    for (let i = 0; i < nonAssetAsWasCodes.length; i++) {
      if (!nonAssetAsWasCodes[i].trim() && !nonAssetToBeCodes[i].trim()) {
        alert("AS-WAS와 TO-BE 코드 중 최소 하나는 입력해 주세요.");
        return;
      }
    }

    const combinedPptNos = [...nonAssetPptNos, ...assetPptNos];
    const combinedAsWas = [...nonAssetAsWasCodes, ...assetAsWasCodes];
    const combinedToBe = [...nonAssetToBeCodes, ...assetToBeCodes];
    const aswasTobeList = combinedAsWas.map((_, idx) => ({
      ppt_no: combinedPptNos[idx],
      aswas_code: combinedAsWas[idx],
      tobe_code: combinedToBe[idx],
    }));
    const formData = new FormData();
    formData.append("templateId", templateID);
    formData.append("ticket_num", ticketNum);
    formData.append("ticket_url", ticketURL);
    formData.append("create_date", new Date().toISOString().split("T")[0]);
    formData.append("aswas_tobe_list", JSON.stringify(aswasTobeList));

    try {
      const url = saveType === "create" ? `${BASE_URL}/create` : `${BASE_URL}/update-template`;
      await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("템플릿이 성공적으로 저장되었습니다");
      setIsTemplateCreated(true);
    } catch (err) {
      console.error(err);
      setIsTemplateCreated(false);
      alert("템플릿 저장 중 오류가 발생하였습니다");
    }
  };

  // (사용x) drag & drop
  // const onDragEnd = (res) => {
  //   if (!res.destination) return;
  //   const reorder = (list, s, e) => {
  //     const arr = [...list];
  //     const [m] = arr.splice(s, 1);
  //     arr.splice(e, 0, m);
  //     return arr;
  //   };
  //   setNonAssetAsWasCodes((p) => reorder(p, res.source.index, res.destination.index));
  //   setNonAssetToBeCodes((p) => reorder(p, res.source.index, res.destination.index));
  //   setNonAssetPptNos((p) => reorder(p, res.source.index, res.destination.index));
  // };

  const countOccurrences = (asWasCode) => kind_countOccurrences(fileContent, asWasCode);

  // 로컬라이제이션 생성
  const handleCreateLocalization = async () => {
    if (!isTemplateCreated) {
      alert("핫픽스 템플릿을 먼저 생성해 주세요.");
      return;
    }
    try {
      const body = { 
        ticket_num: ticketNum, 
        ticket_url: ticketURL, 
        localization_list: 
          localizedItems.map((item) => (
            item.id 
              ? { id: item.id, local_code: item.local_code }
              : { local_code: item.local_code }
          )), 
        delete_ids: deleteIds,
      };
      
      await axios.put(`${BASE_URL}/localization/template`, body, { headers: { "Content-Type": "application/json" } });
      setDeleteIds([]);
      const { data } = await axios.post(`${BASE_URL}/get-template-details`, { ticket_num: ticketNum, ticket_url: ticketURL });
      setLocalizedItems(data.localization_list || []);
      alert(saveType === "create" ? "로컬라이제이션 템플릿이 생성되었습니다" : "로컬라이제이션 템플릿이 수정되었습니다");
    } catch (err) {
      console.error("[Error] handleCreateLocalization", err);
      alert(saveType === "create" ? "로컬라이제이션 생성 중 오류가 발생했습니다" : "로컬라이제이션 수정 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-[110px]">
      {/* 📄 핫픽스 템플릿 생성 및 불러오기 */}
      <CheckTemplate 
        setSaveType={setSaveType} 
        setIsTemplateCreated={setIsTemplateCreated} 
        setTemplateID={setTemplateID} 
        setNonAssetPptNos={setNonAssetPptNos} 
        setNonAssetAsWasCodes={setNonAssetAsWasCodes} 
        setNonAssetToBeCodes={setNonAssetToBeCodes} 
        setAssetPptNos={setAssetPptNos} 
        setAssetAsWasCodes={setAssetAsWasCodes} 
        setAssetToBeCodes={setAssetToBeCodes} 
        ticketNum={ticketNum} 
        ticketURL={ticketURL} 
        setTicketNum={setTicketNum} 
        setTicketURL={setTicketURL} 
        setLocalizedItems={setLocalizedItems} 
        setDeleteIds={setDeleteIds} 
      />

      {/* 📤 파일 업로드 */}
      <UploadFiles 
        setNonAssetPptNos={setNonAssetPptNos} 
        setNonAssetAsWasCodes={setNonAssetAsWasCodes} 
        setNonAssetToBeCodes={setNonAssetToBeCodes} 
        setAssetPptNos={setAssetPptNos} 
        setAssetAsWasCodes={setAssetAsWasCodes} 
        setAssetToBeCodes={setAssetToBeCodes} 
        setFileContent={setFileContent} 
      />

      {/* ✅ AS-WAS / TO-BE 템플릿 */}
      <h2 className="font-bold text-black mb-5 text-[16px]">✅ AS-WAS / TO-BE 템플릿</h2>
      <div className="mb-5">
        <Asset_Template 
          assetPptNos={assetPptNos} 
          assetAsWasCodes={assetAsWasCodes} 
          assetToBeCodes={assetToBeCodes} 
          addAssetArea={addAssetArea} 
          removeAssetArea={removeAssetArea} 
          isTemplateAvailable={isTemplateAvailable} 
          setAssetPptNos={handleAssetPptNoChange} 
          setAssetAsWasCodes={handleAssetAsWasChange} 
          setAssetToBeCodes={handleAssetToBeChange} 
          fileContent={fileContent} 
        />
      </div>

      <DragDropContext 
        // onDragEnd={onDragEnd} // 컴포넌트 동작 안해서 기능 사용 안함
      >
        <Droppable droppableId="droppable">
          {(prov) => (
            <ul {...prov.droppableProps} ref={prov.innerRef} className="as_was_to_be_row">
              {nonAssetAsWasCodes.map((_, i) => (
                <Draggable key={i} draggableId={`item-${i}`} index={i}>
                  {(p) => (
                    <li ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="as_was_to_be_div">
                      <div className="flex flex-col justify-center items-center gap-[10px]">
                        <div className="flex items-center gap-[10px]">
                          <label className="font-[16px]">PPT NO.</label>
                          <input
                            type="text"
                            className="w-[30px] h-[30px] rounded-[5px] text-center border border-[#8B8B8B] outline-none focus:border-[#595880]"
                            value={nonAssetPptNos[i]}
                            onChange={(e) => {
                              const arr = [...nonAssetPptNos];
                              arr[i] = e.target.value;
                              setNonAssetPptNos(arr);
                            }}
                          />
                        </div>

                        <CopyTextButton
                          text={"ppt{숫자}로 복사"}
                          value={`ppt${nonAssetPptNos[i] ?? ''}`}
                        />
                        
                      </div>
                      <div className="w-[80%] flex gap-[20px] justify-between">
                        <div className="as_was_div">
                          <textarea
                            rows="5"
                            className="code-textarea"
                            placeholder="AS-WAS 코드를 입력해 주세요."
                            value={nonAssetAsWasCodes[i]}
                            onChange={(e) => {
                              const arr = [...nonAssetAsWasCodes];
                              arr[i] = e.target.value;
                              setNonAssetAsWasCodes(arr);
                            }}
                          />
                          <div className="flex">
                            <Frequency />
                            <span className="ml-1 text-xs"
                              style={{
                                color: countOccurrences(nonAssetAsWasCodes[i]) === 1 ? "blue" : "red"
                              }}>
                                {countOccurrences(nonAssetAsWasCodes[i]) === 0 ? "없음" : `${countOccurrences(nonAssetAsWasCodes[i])}번`}
                            </span>
                          </div>

                          <CopyTextButton
                            text={"코드 복사"}
                            value={nonAssetAsWasCodes[i]}
                            style={{ marginTop: "15px" }}
                          />
                        </div>
                        <div className="to_be_div">
                          <textarea
                            rows="5"
                            className="code-textarea"
                            placeholder="TO-BE 코드를 입력해 주세요."
                            value={nonAssetToBeCodes[i]}
                            onChange={(e) => {
                              const arr = [...nonAssetToBeCodes];
                              arr[i] = e.target.value;
                              setNonAssetToBeCodes(arr);
                            }}
                          />

                          <div className="text-xs">
                            <span className="ml-1 font-bold text-[#4b5563;]">[TO-BE]</span>
                          </div>

                          <CopyTextButton
                            text={"코드 복사"}
                            value={nonAssetToBeCodes[i]}
                            style={{ marginTop: "15px" }}
                          />
                        </div>
                      </div>
                      <button type="button" onClick={() => removeTextArea(i)} className="px-4 mb-6 transition-colors duration-300 border border-gray-300 rounded cursor-pointer hover:bg-red-500 hover:text-white">
                        삭제
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {prov.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <div className="flex gap-[15px] save_button_div mt-[50px]">
        <button onClick={addTextArea} className="plus-button rounded-[10px]">
          <AddIcon />
          <span className="ml-2">항목 추가</span>
        </button>
        <button type="button" className="save_button" onClick={handleSave}>
          {saveType === "update" ? ` 핫픽스 템플릿 수정` : ` 핫픽스 템플릿 생성`}
        </button>
      </div>

      {/* 📤 번역 파일 업로드 */}
      <TransFileUpload 
        isTemplateCreated={isTemplateCreated} 
        setEnglishCopy={setEnglishCopy} 
      />

      {/* 🌐 로컬라이제이션 템플릿 */}
      <h2 className="font-bold text-black mb-5 text-[16px]">🌐 로컬라이제이션 템플릿</h2>
      <div className="flex flex-col">
        {localizedItems.map((item, idx) => (
          <TransBox
            key={idx}
            text={item.local_code}
            highlights={englishCopy}
            onChange={(newTxt) => {
              setLocalizedItems((prev) => {
                const a = [...prev];
                a[idx].local_code = newTxt;
                return a;
              });
            }}
            onDelete={() => {
              setLocalizedItems((prev) => prev.filter((_, i) => i !== idx));
              if (item.id) setDeleteIds((prev) => [...prev, item.id]);
            }}
          />
        ))}
      </div>
      <div className="flex gap-[15px] save_button_div mt-[50px]">
        <button className="plus-button rounded-[10px]" onClick={() => setLocalizedItems((prev) => [...prev, { local_code: "" }])}>
          <AddIcon />
          <span className="ml-2">항목 추가</span>
        </button>
        <button type="button" className="save_button" onClick={handleCreateLocalization} disabled={!isTemplateCreated}>
          {` 로컬라이제이션 템플릿 ${saveType === "update" ? "수정" : "생성"}`}
        </button>
      </div>
    </div>
  );
};

export default Create_template;
