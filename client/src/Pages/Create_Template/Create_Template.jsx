import React from "react";
import AddIcon from "@mui/icons-material/Add";
import CheckTemplate from "../../Components/CheckTemplate/CheckTemplate";
import UploadFiles from "./UploadFiles";
import Asset_Template from "./Asset_template";
import "@Create_Template/Create_Template.scss";
import CopyTextButton from "@/Components/Common/CopyTextButton";
import { useCheckTemplate } from "@/hooks/CheckTemplate/useCheckTemplate";

const Create_Template = () => {
  const {
      ticketNum,
      setTicketNum,
      ticketURL,
      setTicketURL,
      saveType,
      setSaveType,
      isTemplateCreated,
      setIsTemplateCreated,
      localizedItems,
      setLocalizedItems,
      deleteIds,
      setDeleteIds,
      nonAssetAsWasCodes,
      setNonAssetAsWasCodes,
      nonAssetToBeCodes,
      setNonAssetToBeCodes,
      nonAssetPptNos,
      setNonAssetPptNos,
      assetAsWasCodes,
      setAssetAsWasCodes,
      assetToBeCodes,
      setAssetToBeCodes,
      assetPptNos,
      setAssetPptNos,
      templateID,
      setTemplateID,
      isTemplateAvailable,
      originalHtmlFile,
      setOriginalHtmlFile,
      addTextArea,
      removeTextArea,
      addAssetArea,
      removeAssetArea,
      handleAssetAsWasChange,
      handleAssetToBeChange,
      handleAssetPptNoChange,
      countOccurrences,
      handleSaveTemplate,
  } = useCheckTemplate();

  return (
    <div className="bg-[#FFFFFF] p-[40px]">
      {/* 📄 핫픽스 템플릿 생성 및 불러오기 */}
      <CheckTemplate
        ticketNum={ticketNum}
        ticketURL={ticketURL}
        setTicketNum={setTicketNum}
        setTicketURL={setTicketURL}
        setTemplateID={setTemplateID}
        setIsTemplateCreated={setIsTemplateCreated}
        setSaveType={setSaveType}
        setNonAssetPptNos={setNonAssetPptNos}
        setNonAssetAsWasCodes={setNonAssetAsWasCodes}
        setNonAssetToBeCodes={setNonAssetToBeCodes}
        setAssetPptNos={setAssetPptNos}
        setAssetAsWasCodes={setAssetAsWasCodes}
        setAssetToBeCodes={setAssetToBeCodes}
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
        setOriginalHtmlFile={setOriginalHtmlFile} 
      />

      {/* ✅ AS-WAS / TO-BE 템플릿 */}
      <h2 className="font-bold text-black mb-5 text-[16px]">✅ AS-WAS / TO-BE 템플릿</h2>

      {/* Asset */}
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
          originalHtmlFile={originalHtmlFile} 
        />
      </div>

      {/* Non-Asset */}
      {nonAssetAsWasCodes.map((nonAssetAsWasCode, i) => (
        <div key={i} index={i} className="as_was_to_be_div">
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
              text={"'ppt{숫자}'로 복사"}
              value={`ppt${nonAssetPptNos[i] ?? ''}`}
            />
            <CopyTextButton
              text={"'슬라이드 {숫자}'로 복사"}
              value={`슬라이드 ${nonAssetPptNos[i] ?? ''}`}
            />
            
          </div>
          <div className="w-[80%] flex gap-[20px] justify-between">
            <div className="as_was_div">
              <textarea
                rows="5"
                className="code-textarea"
                placeholder="AS-WAS 코드를 입력해 주세요."
                value={nonAssetAsWasCode}
                onChange={(e) => {
                  const arr = [...nonAssetAsWasCode];
                  arr[i] = e.target.value;
                  setNonAssetAsWasCodes(arr);
                }}
              />
              <div className="flex font-bold">
                <div className="text-xs">
                  <span className="ml-1 text-[#4b5563;]">
                    [AS-WAS] 원본코드 내 AS-WAS 코드 출현 횟수:
                  </span>
                </div>
                {originalHtmlFile ? (
                  <span className="ml-1 text-xs"
                    style={{
                      color: countOccurrences(nonAssetAsWasCode) === 1 ? "blue" : "red"
                    }}>
                      {`${countOccurrences(nonAssetAsWasCode)}회`}
                  </span>
                ) : (
                  <span className="ml-1 text-xs font-normal">
                    {`(원본코드 업로드 필요)`}
                  </span>
                )}
              </div>

              <CopyTextButton
                text={"코드 복사"}
                value={nonAssetAsWasCode}
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
        </div>
      ))}

      <div className="flex gap-[15px] save_button_div mt-[50px]">
        <button onClick={addTextArea} className="plus-button rounded-[10px]">
          <AddIcon />
          <span className="ml-2">항목 추가</span>
        </button>
        <button type="button" className="save_button" onClick={handleSaveTemplate}>
          {saveType === "update" ? ` 핫픽스 템플릿 수정` : ` 핫픽스 템플릿 생성`}
        </button>
      </div>
    </div>
  );
};

export default Create_Template;
