import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { kind_countOccurrences as countOccurrencesUtil } from "@/utils/codeUtils";
import AddIcon from "@mui/icons-material/Add";
import Frequency from "@Create_Template/Frequency";
import CheckTemplate from "./CheckTemplate";
import UploadFiles from "./UploadFiles";
import "@Create_Template/Create_Template.scss";
import TransBox from "../../Components/Common/TransBox";

const Create_template = () => {
  // AS-WAS / TO-BE states
  const [asWasCodes, setAsWasCodes] = useState(["", "", ""]);
  const [toBeCodes, setToBeCodes] = useState(["", "", ""]);
  const [pptNos, setPptNos] = useState(["", "", ""]);
  const [asset_asWas, setAsset_asWas] = useState([]);
  const [asset_toBe, setAsset_toBe] = useState([]);
  const [asset_pptNo, setAsset_pptNo] = useState([]);

  // Template and ticket info
  const [templateID, setTemplateID] = useState("");
  const [ticketNum, setTicketNum] = useState("");
  const [ticketURL, setTicketURL] = useState("");

  // File upload and code occurrence
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  // Save type: 'create' or 'update'
  const [save_type, setSave_type] = useState("");

  // Localization: original translations and tobe codes
  const [englishCopy, setEnglishCopy] = useState([]); // 번역 API 원문
  const [tobeCodeList, setTobeCodeList] = useState([]); // tobe-code-list 응답

  // Items for localization template and IDs to delete
  const [localizedItems, setLocalizedItems] = useState([{ local_code: "" }, { local_code: "" }]);
  const [deleteIds, setDeleteIds] = useState([]);

  // 1) 번역.txt 업로드 후 englishCopy 세팅 → tobe-code-list API 호출
  useEffect(() => {
    if (englishCopy.length && ticketNum && ticketURL) {
      axios
        .post(`${BASE_URL}/localization/tobe-code-list`, {
          ticket_num: ticketNum,
          ticket_url: ticketURL,
        })
        .then((res) => setTobeCodeList(res.data.tobe_code_list || []))
        .catch((err) => console.error("Error fetching tobe_code_list:", err));
    }
  }, [englishCopy, ticketNum, ticketURL]);

  // 2) 영어 원문이 있을 때만 기존 tobeCodeList → localizedItems 덮어쓰기
  useEffect(() => {
    if (englishCopy.length) {
      const items = tobeCodeList
        .filter((item) => englishCopy.some((orig) => item.tobe_code.includes(orig)))
        .map((item) => ({
          id: item.id,
          local_code: item.tobe_code,
        }));
      setLocalizedItems(items.length ? items : []);
    }
  }, [tobeCodeList, englishCopy]);

  // AS-WAS / TO-BE 항목 추가·삭제
  const addTextArea = () => {
    setAsWasCodes((prev) => [...prev, ""]);
    setToBeCodes((prev) => [...prev, ""]);
    setPptNos((prev) => [...prev, ""]);
  };
  const removeTextArea = (idx) => {
    setAsWasCodes((prev) => prev.filter((_, i) => i !== idx));
    setToBeCodes((prev) => prev.filter((_, i) => i !== idx));
    setPptNos((prev) => prev.filter((_, i) => i !== idx));
  };
  const addAssetArea = () => {
    setAsset_asWas((prev) => [...prev, ""]);
    setAsset_toBe((prev) => [...prev, ""]);
    setAsset_pptNo((prev) => [...prev, ""]);
  };

  // 핫픽스 템플릿 저장
  const handleSave = async () => {
    const combinedPptNos = [...pptNos, ...asset_pptNo];
    const combinedAsWas = [...asWasCodes, ...asset_asWas];
    const combinedToBe = [...toBeCodes, ...asset_toBe];
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
      const url = save_type === "create" ? `${BASE_URL}/create` : `${BASE_URL}/update-template`;
      await axios.post(url, formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("템플릿이 성공적으로 저장되었습니다");
    } catch (err) {
      console.error("Error sending data", err);
      alert("템플릿 저장 중 오류가 발생하였습니다");
    }
  };

  // 드래그앤드롭 핸들러
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reorder = (list, start, end) => {
      const arr = Array.from(list);
      const [moved] = arr.splice(start, 1);
      arr.splice(end, 0, moved);
      return arr;
    };
    setAsWasCodes((prev) => reorder(prev, result.source.index, result.destination.index));
    setToBeCodes((prev) => reorder(prev, result.source.index, result.destination.index));
    setPptNos((prev) => reorder(prev, result.source.index, result.destination.index));
  };

  const countOccurrences = (code) => (fileContent ? countOccurrencesUtil(fileContent, code) || "0" : "");

  const allFieldsFilled = () => asWasCodes.every((c) => c.trim()) && toBeCodes.every((c) => c.trim()) && asset_asWas.every((c) => c.trim()) && asset_toBe.every((c) => c.trim());

  // 로컬라이제이션 템플릿 생성
  const handleCreateLocalization = async () => {
    try {
      const body = {
        ticket_num: ticketNum,
        ticket_url: ticketURL,
        localization_list: localizedItems.map((item) => (item.id ? { id: item.id, local_code: item.local_code } : { local_code: item.local_code })),
        delete_ids: deleteIds,
      };
      console.log("Request body:", body);

      await axios.put(`${BASE_URL}/localization/template`, body, {
        headers: { "Content-Type": "application/json" },
      });
      alert("로컬라이제이션 템플릿이 생성되었습니다");
    } catch (err) {
      console.error("Error creating localization template:", err);
      alert("로컬라이제이션 생성 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-[110px]">
      <CheckTemplate setSave_type={setSave_type} setAsWasCodes={setAsWasCodes} setToBeCodes={setToBeCodes} setAsset_asWas={setAsset_asWas} setTemplateID={setTemplateID} setPptNos={setPptNos} setAsset_toBe={setAsset_toBe} setAsset_pptNo={setAsset_pptNo} ticketNum={ticketNum} ticketURL={ticketURL} setTicketNum={setTicketNum} setTicketURL={setTicketURL} setLocalizedItems={setLocalizedItems} />

      <UploadFiles file={file} asset_pptNo={asset_pptNo} asset_asWas={asset_asWas} setAsset_asWas={setAsset_asWas} asset_toBe={asset_toBe} setAsset_toBe={setAsset_toBe} addAssetArea={addAssetArea} isTemplateAvailable={Boolean(templateID)} setAsset_pptNo={setAsset_pptNo} fileContent={fileContent} setFile={setFile} setFileContent={setFileContent} setPptNos={setPptNos} setAsWasCodes={setAsWasCodes} setToBeCodes={setToBeCodes} setEnglishCopy={setEnglishCopy} />

      <h2 className="font-bold text-black mb-5 text-[16px]">✅ 핫픽스 AS-WAS / TO-BE</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(prov) => (
            <ul {...prov.droppableProps} ref={prov.innerRef} className="as_was_to_be_row">
              {asWasCodes.map((_, i) => (
                <Draggable key={i.toString()} draggableId={`item-${i}`} index={i}>
                  {(p) => (
                    <li ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="as_was_to_be_div">
                      <div className="flex items-center gap-[10px]">
                        <label className="font-[16px]">PPT NO.</label>
                        <input
                          type="text"
                          className="w-[30px] h-[30px] rounded-[5px] text-center border border-[#8B8B8B] outline-none  focus:border-1 focus:border-[#595880]"
                          value={pptNos[i]}
                          onChange={(e) => {
                            const arr = [...pptNos];
                            arr[i] = e.target.value;
                            setPptNos(arr);
                          }}
                        />
                      </div>
                      <div className="w-[80%] flex gap-[20px] justify-between">
                        <div className="as_was_div">
                          <textarea
                            rows="5"
                            value={asWasCodes[i]}
                            onChange={(e) => {
                              const arr = [...asWasCodes];
                              arr[i] = e.target.value;
                              setAsWasCodes(arr);
                            }}
                            placeholder="AS-WAS 코드를 입력해 주세요."
                            className="code-textarea"
                          />
                          <div className="duplicate-count">
                            <Frequency />
                            {countOccurrences(asWasCodes[i])}
                          </div>
                        </div>
                        <div className="to_be_div">
                          <textarea
                            rows="5"
                            value={toBeCodes[i]}
                            onChange={(e) => {
                              const arr = [...toBeCodes];
                              arr[i] = e.target.value;
                              setToBeCodes(arr);
                            }}
                            placeholder="TO-BE 코드를 입력해 주세요."
                            className="code-textarea"
                          />
                        </div>
                      </div>
                      <button type="button" onClick={() => removeTextArea(i)} className="px-4 mt-0 mb-6 transition-colors duration-300 border border-gray-300 rounded cursor-pointer hover:bg-red-500 hover:text-white">
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
        <button onClick={addTextArea} className="plus-button rouned-[10px]">
          <AddIcon />
          <span className="add_button_text">항목 추가</span>
        </button>
        <button type="button" className="save_button" onClick={handleSave} disabled={!allFieldsFilled()}>
          {save_type === "update" ? "핫픽스 템플릿 수정" : save_type === "create" ? "핫픽스 템플릿 생성" : "핫픽스 템플릿 생성"}
        </button>
      </div>

      <h2 className="font-bold text-black mb-5 text-[16px]">🌐 번역 위치 확인</h2>
      <div className="flex flex-col">
        {localizedItems.map((item, idx) => (
          <TransBox
            key={idx}
            text={item.local_code}
            highlights={englishCopy}
            onChange={(newTxt) => {
              setLocalizedItems((prev) => {
                const arr = [...prev];
                arr[idx].local_code = newTxt;
                return arr;
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
        <button className="plus-button rouned-[10px]" onClick={() => setLocalizedItems((prev) => [...prev, { local_code: "" }])}>
          <AddIcon fontSize="small" />
          <span>항목 추가</span>
        </button>
        <button type="button" className="save_button" onClick={handleCreateLocalization} disabled={!localizedItems.length}>
          로컬라이제이션 템플릿 생성
        </button>
      </div>
    </div>
  );
};

export default Create_template;
