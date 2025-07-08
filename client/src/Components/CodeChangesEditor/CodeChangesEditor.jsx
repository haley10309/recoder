import React from "react";
import AddIcon from "@mui/icons-material/Add";

import AssetTemplate from "@/Pages/ManageTemplates/AssetTemplate";
import CopyTextButton from "../Common/CopyTextButton";
import Gap from "../Common/Gap";

const CodeChangesEditor = ({
  checkOnlyInvalidCount,
  saveType,
  assetCodeChanges,
  addAssetArea,
  removeAssetArea,
  addNonAssetTextArea,
  removeNonAssetTextArea,
  originalHtmlFile,
  countOccurrences,
  handleAssetPptNoChange,
  handleAssetAsWasChange,
  handleAssetToBeChange,
  handleSaveTemplate,
  checkHasInvalidAsWasCount,
  nonAssetCodeChanges,
  handleNonAssetPptNoChange,
  handleNonAssetAswasChange,
  handleNonAssetTobeChange,
}) => {
  if (checkOnlyInvalidCount) {
    return (
      <div className="flex flex-col items-center">
        {originalHtmlFile ? (
          <>
            {checkHasInvalidAsWasCount() ? (
              <div style={{ color: "#ff0019", fontSize: "15px", fontWeight: "bold", textAlign: "center" }}>
                ⚠️원본코드 내 AS-WAS 코드 출현 횟수가 1이 아닌 항목이 있습니다. <br/> Edit Template 페이지에서 템플릿을 확인해주세요.
              </div>
            ) : (
              <div style={{ color: "#00c93c", fontSize: "15px", fontWeight: "bold", textAlign: "center" }}>
                ✅모든 항목의 '원본코드 내 AS-WAS 코드 출현 횟수'가 1이에요. 템플릿으로 사용해도 좋아요.
              </div>
            )}
            <div style={{ color: "#858585", fontSize: "12px" }}>
                (non-asset 기준. asset은 포함시키지 않았음)
            </div>
          </>
        ) : (
          <div className="flex flex-col">
            <Gap gap={40} />
            <div style={{ color: "grey", fontSize: "15px", fontWeight: "bold" }}>
              💁‍♀️원본코드를 업로드해야 '원본코드 내 AS-WAS 코드 출현 횟수'를 확인할 수 있어요.
            </div>
            <Gap gap={40} />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Asset */}
      {/* <AssetTemplate
        assetCodeChanges={assetCodeChanges}
        handleAssetPptNoChange={handleAssetPptNoChange}
        handleAssetAsWasChange={handleAssetAsWasChange}
        handleAssetToBeChange={handleAssetToBeChange}
        addAssetArea={addAssetArea} 
        removeAssetArea={removeAssetArea} 
        originalHtmlFile={originalHtmlFile} 
      /> */}

      <div className="flex flex-col items-center">
        {originalHtmlFile ? (
          <>
            {checkHasInvalidAsWasCount() ? (
              <div style={{ color: "#ff0019", fontSize: "15px", fontWeight: "bold" }}>
                👇👇 ⚠️원본코드 내 AS-WAS 코드 출현 횟수가 1이 아닌 항목이 있습니다. 확인이 필요해요! 👇👇
              </div>
            ) : (
              <div style={{ color: "#00c93c", fontSize: "15px", fontWeight: "bold" }}>
                ✅모든 항목의 '원본코드 내 AS-WAS 코드 출현 횟수'가 1이에요. 템플릿으로 사용해도 좋아요.
              </div>
            )}
            <div style={{ color: "#858585", fontSize: "12px" }}>
                (non-asset 기준. asset은 포함시키지 않았음)
            </div>
          </>
        ) : (
          <div style={{ color: "grey", fontSize: "15px", fontWeight: "bold" }}>
            💁‍♀️원본코드를 업로드해야 코드 출현 횟수를 확인할 수 있어요.
          </div>
        )}
      </div>
      <Gap gap={30} />

      {/* Non-Asset */}
      {nonAssetCodeChanges.map((item, idx) => (
        <div key={`non-asset-code-change-${idx}`} >
          <div style={{ fontSize: "12px" }}>{`${idx + 1} of ${nonAssetCodeChanges.length}`}</div>

          <div index={idx} className="as_was_to_be_div">
            <div className="flex flex-col justify-center items-center gap-[10px]">
              <div className="flex items-center gap-[10px]">
                <label className="font-[16px]">PPT NO.</label>
                <input
                  type="text"
                  className="w-[30px] h-[30px] rounded-[5px] text-center border border-[#8B8B8B] outline-none focus:border-[#595880]"
                  value={item.ppt_no}
                  onChange={(e) => handleNonAssetPptNoChange(idx, e.target.value)}
                />
              </div>

              <div style={{ fontSize: "10px" }}>CodeChange.id: {item.id ? item.id : "-"}</div>

              {!!item.ppt_no && (
                <>
                  <CopyTextButton
                    text={"'ppt{숫자}'로 복사"}
                    value={`ppt${item.ppt_no ?? ''}`}
                  />
                  <CopyTextButton
                    text={"'슬라이드 {숫자}'로 복사"}
                    value={`슬라이드 ${item.ppt_no ?? ''}`}
                  />
                </>
              )}
            </div>
            <div className="w-[80%] flex gap-[20px] justify-between">
              <div className="as_was_div">
                <textarea
                  rows="5"
                  className="code-textarea"
                  placeholder="AS-WAS 코드를 입력해 주세요."
                  value={item.aswas_code}
                  onChange={(e) => handleNonAssetAswasChange(idx, e.target.value)}
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
                        color: countOccurrences(item.aswas_code) === 1 ? "blue" : "red"
                      }}>
                        {`${countOccurrences(item.aswas_code)}회`}
                    </span>
                  ) : (
                    <span className="ml-1 text-xs font-normal text-[#ff7300]">
                      (원본코드 업로드 필요)
                    </span>
                  )}
                </div>

                <CopyTextButton
                  text={"코드 복사"}
                  value={item.aswas_code}
                  style={{ marginTop: "15px" }}
                />
              </div>
              <div className="to_be_div">
                <textarea
                  rows="5"
                  className="code-textarea"
                  placeholder="TO-BE 코드를 입력해 주세요."
                  value={item.tobe_code}
                  onChange={(e) => handleNonAssetTobeChange(idx, e.target.value)}
                />

                <div className="text-xs">
                  <span className="ml-1 font-bold text-[#4b5563;]">[TO-BE]</span>
                </div>

                <CopyTextButton
                  text={"코드 복사"}
                  value={item.tobe_code}
                  style={{ marginTop: "15px" }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeNonAssetTextArea(idx)}
              className="px-4 mb-6 transition-colors duration-300 border border-gray-300 rounded cursor-pointer hover:bg-red-500 hover:text-white"
            >
              삭제
            </button>
          </div>
        </div>
      ))}

      <div className="flex gap-[15px] save_button_div">
        <button onClick={addNonAssetTextArea} className="plus-button rounded-[10px]">
          <AddIcon />
          <span className="ml-2">항목 추가</span>
        </button>
        <button type="button" className="save_button" onClick={handleSaveTemplate}>
          {saveType === "update" ? ` 템플릿 수정` : ` 템플릿 생성`}
        </button>
      </div>
    </>
  );
};

export default CodeChangesEditor;