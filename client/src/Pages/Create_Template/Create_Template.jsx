import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "@/utils/routePath";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { kind_countOccurrences as countOccurrencesUtil } from "@/utils/codeUtils";
import AddIcon from "@mui/icons-material/Add";
import Frequency from "@Create_Template/Frequency";
import CheckTemplate from "./CheckTemplate";
import UploadFiles from "./UploadFiles";
import Asset_Template from "./Asset_template";
import "@Create_Template/Create_Template.scss";
import TransBox from "../../Components/Common/TransBox";
import TransFileUpload from "./TransFileUpload";

const Create_template = () => {
  // AS-WAS / TO-BE states
  const [asWasCodes, setAsWasCodes] = useState(["", "", ""]);
  const [toBeCodes, setToBeCodes] = useState(["", "", ""]);
  const [pptNos, setPptNos] = useState(["", "", ""]);

  // Asset-based states
  const [asset_asWas, setAsset_asWas] = useState([]);
  const [asset_toBe, setAsset_toBe] = useState([]);
  const [asset_pptNo, setAsset_pptNo] = useState([]);

  // Template and ticket info
  const [templateID, setTemplateID] = useState("");
  const isTemplateAvailable = Boolean(templateID);

  const [ticketNum, setTicketNum] = useState("");
  const [ticketURL, setTicketURL] = useState("");

  // File upload and content
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState("");

  // Save flags
  const [isHotfixCreated, setIsHotfixCreated] = useState(false);
  const [save_type, setSave_type] = useState("");

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

  // Asset handlers
  const removeAssetArea = (i) => {
    setAsset_asWas((prev) => prev.filter((_, idx) => idx !== i));
    setAsset_toBe((prev) => prev.filter((_, idx) => idx !== i));
    setAsset_pptNo((prev) => prev.filter((_, idx) => idx !== i));
  };
  const handleAssetAsWasChange = (i, v) =>
    setAsset_asWas((prev) => {
      const a = [...prev];
      a[i] = v;
      return a;
    });
  const handleAssetToBeChange = (i, v) =>
    setAsset_toBe((prev) => {
      const a = [...prev];
      a[i] = v;
      return a;
    });
  const handleAssetPptNoChange = (i, v) =>
    setAsset_pptNo((prev) => {
      const a = [...prev];
      a[i] = v;
      return a;
    });

  // 핫픽스 템플릿 저장
  const handleSave = async () => {
    // AS-WAS/TO-BE validation: 동시에 비어있는 row 차단
    for (let i = 0; i < asWasCodes.length; i++) {
      if (!asWasCodes[i].trim() && !toBeCodes[i].trim()) {
        alert("AS-WAS와 TO-BE 코드 중 최소 하나는 입력해 주세요.");
        return;
      }
    }

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
      setIsHotfixCreated(true);
    } catch (err) {
      console.error(err);
      alert("템플릿 저장 중 오류가 발생하였습니다");
    }
  };

  // drag & drop
  const onDragEnd = (res) => {
    if (!res.destination) return;
    const reorder = (list, s, e) => {
      const arr = [...list];
      const [m] = arr.splice(s, 1);
      arr.splice(e, 0, m);
      return arr;
    };
    setAsWasCodes((p) => reorder(p, res.source.index, res.destination.index));
    setToBeCodes((p) => reorder(p, res.source.index, res.destination.index));
    setPptNos((p) => reorder(p, res.source.index, res.destination.index));
  };

  const countOccurrences = (code) => (fileContent ? countOccurrencesUtil(fileContent, code) || "0" : "");

  // 로컬라이제이션 생성
  const handleCreateLocalization = async () => {
    if (!isHotfixCreated) {
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
      alert(save_type === "create" ? "로컬라이제이션 템플릿이 생성되었습니다" : "로컬라이제이션 템플릿이 수정되었습니다");
    } catch (err) {
      console.error("[Error] handleCreateLocalization", err);
      alert(save_type === "create" ? "로컬라이제이션 생성 중 오류가 발생했습니다" : "로컬라이제이션 수정 중 오류가 발생했습니다");
    }
  };

  return (
    <div className="bg-[#FFFFFF] p-[110px]">
      <CheckTemplate setSave_type={setSave_type} setAsWasCodes={setAsWasCodes} setToBeCodes={setToBeCodes} setAsset_asWas={setAsset_asWas} setAsset_toBe={setAsset_toBe} setTemplateID={setTemplateID} setPptNos={setPptNos} setAsset_pptNo={setAsset_pptNo} ticketNum={ticketNum} ticketURL={ticketURL} setTicketNum={setTicketNum} setTicketURL={setTicketURL} setLocalizedItems={setLocalizedItems} setDeleteIds={setDeleteIds} setIsHotfixCreated={setIsHotfixCreated} />

      <UploadFiles setPptNos={setPptNos} setAsWasCodes={setAsWasCodes} setToBeCodes={setToBeCodes} setAsset_pptNo={setAsset_pptNo} setAsset_asWas={setAsset_asWas} setAsset_toBe={setAsset_toBe} setFileContent={setFileContent} setFile={setFile} />

      <h2 className="font-bold text-black mb-5 text-[16px]">✅ AS-WAS / TO-BE 템플릿</h2>
      <div className="mb-5">
        <Asset_Template asset_pptNo={asset_pptNo} asset_asWas={asset_asWas} asset_toBe={asset_toBe} addAssetArea={addAssetArea} removeAssetArea={removeAssetArea} isTemplateAvailable={isTemplateAvailable} setAsset_asWas={handleAssetAsWasChange} setAsset_toBe={handleAssetToBeChange} setAsset_pptNo={handleAssetPptNoChange} fileContent={fileContent} />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(prov) => (
            <ul {...prov.droppableProps} ref={prov.innerRef} className="as_was_to_be_row">
              {asWasCodes.map((_, i) => (
                <Draggable key={i} draggableId={`item-${i}`} index={i}>
                  {(p) => (
                    <li ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps} className="as_was_to_be_div">
                      <div className="flex items-center gap-[10px]">
                        <label className="font-[16px]">PPT NO.</label>
                        <input
                          type="text"
                          className="w-[30px] h-[30px] rounded-[5px] text-center border border-[#8B8B8B] outline-none focus:border-[#595880]"
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
                            className="code-textarea"
                            placeholder="AS-WAS 코드를 입력해 주세요."
                            value={asWasCodes[i]}
                            onChange={(e) => {
                              const arr = [...asWasCodes];
                              arr[i] = e.target.value;
                              setAsWasCodes(arr);
                            }}
                          />
                          <div className="flex">
                            <Frequency />
                            <span className="ml-1 text-xs">{countOccurrences(asWasCodes[i]) === "0" ? "없음" : `${countOccurrences(asWasCodes[i])}번`}</span>
                          </div>
                        </div>
                        <div className="to_be_div">
                          <textarea
                            rows="5"
                            className="code-textarea"
                            placeholder="TO-BE 코드를 입력해 주세요."
                            value={toBeCodes[i]}
                            onChange={(e) => {
                              const arr = [...toBeCodes];
                              arr[i] = e.target.value;
                              setToBeCodes(arr);
                            }}
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
          {" "}
          {save_type === "update" ? "핫픽스 템플릿 수정" : "핫픽스 템플릿 생성"}
        </button>
      </div>

      <TransFileUpload setEnglishCopy={setEnglishCopy} />

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
        <button type="button" className="save_button" onClick={handleCreateLocalization} disabled={!isHotfixCreated}>
          {" "}
          {save_type === "update" ? "로컬라이제이션 템플릿 수정" : "로컬라이제이션 템플릿 생성"}
        </button>
      </div>
    </div>
  );
};

export default Create_template;
