import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";

import Gap from "@/Components/Common/Gap";
import CopyTextButton from "@/Components/Common/CopyTextButton";

import CountryMultiDropdown from "@/Components/Common/CountryMultiDropdown";

const CodeChangesEditor = ({
  saveType,
  addTextArea,
  removeTextArea,
  backupHtmlFile,
  countOccurrences,
  handleSaveTemplate,
  checkHasInvalidAsWasCount,
  codeChanges,
  handlePptNoChange,
  handleAswasChange,
  handleTobeChange,
  addVariation,
  handleVariationChange,
  removeVariation,
}) => {
  return (
    <>
      <div className="flex flex-col items-center">
        {backupHtmlFile ? (
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

      {codeChanges.map((item, idx) => (
        <div key={`code-change-${idx}`} >
          <div style={{ fontSize: "12px" }}>{`${idx + 1} of ${codeChanges.length}`}</div>

          <div index={idx} className="as_was_to_be_div">
            <div className="flex flex-col justify-center items-center gap-[10px]">
              <div className="flex items-center gap-[10px]">
                <label className="font-[16px]">PPT NO.</label>
                <input
                  type="text"
                  className="w-[30px] h-[30px] rounded-[5px] text-center border border-[#8B8B8B] outline-none focus:border-[#595880]"
                  value={item.ppt_no}
                  onChange={(e) => handlePptNoChange(idx, e.target.value)}
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
            <div className="w-[80%] flex flex-col gap-6">
              {/* ========================= */}
              {/* 1) AS-WAS / TO-BE         */}
              {/* ========================= */}
              <div className="flex items-stretch gap-[20px]">
                <div className="flex flex-col flex-1 border p-3 rounded bg-gray-50">
                  <textarea
                    rows="5"
                    className="code-textarea"
                    placeholder="AS-WAS 코드를 입력해 주세요."
                    value={item.aswas_code}
                    onChange={(e) => handleAswasChange(idx, e.target.value)}
                  />
                  <CopyTextButton text="코드 복사" value={item.aswas_code} style={{ marginTop: "10px" }} />
                </div>

                <div className="flex flex-col flex-1 border p-3 rounded bg-gray-50">
                  <textarea
                    rows="5"
                    className="code-textarea"
                    placeholder="TO-BE 코드를 입력해 주세요."
                    value={item.tobe_code}
                    onChange={(e) => handleTobeChange(idx, e.target.value)}
                  />
                  <CopyTextButton text="코드 복사" value={item.tobe_code} style={{ marginTop: "10px" }} />
                </div>
              </div>

              {/* ========================= */}
              {/* 2) Variations             */}
              {/* ========================= */}
              <div className="border-t pt-4">
                {item.variations?.map((variation, vIdx) => (
                  <div key={vIdx} className="flex items-stretch gap-[20px] mb-4">
                    {/* AS-WAS Variation */}
                    <div className="flex flex-col flex-1 border p-3 rounded bg-gray-50">
                      <CountryMultiDropdown
                        value={variation.countries ?? []}
                        onChange={(updated) => handleVariationChange(idx, vIdx, "countries", updated)}
                      />

                      <textarea
                        rows="4"
                        className="code-textarea mt-2"
                        placeholder="AS-WAS Variation 코드"
                        value={variation.aswas_code_variation ?? ""}
                        onChange={(e) => handleVariationChange(idx, vIdx, "aswas_code_variation", e.target.value)}
                      />

                      <CopyTextButton text="코드 복사" value={variation.aswas_code_variation ?? ""} style={{ marginTop: "10px" }} />
                    </div>

                    {/* TO-BE Variation */}
                    <div className="flex flex-col flex-1 border p-3 rounded bg-gray-50">
                      <textarea
                        rows="4"
                        className="code-textarea"
                        placeholder="TO-BE Variation 코드"
                        value={variation.tobe_code_variation ?? ""}
                        onChange={(e) => handleVariationChange(idx, vIdx, "tobe_code_variation", e.target.value)}
                      />

                      <CopyTextButton text="코드 복사" value={variation.tobe_code_variation ?? ""} style={{ marginTop: "10px" }} />

                      <button
                        type="button"
                        onClick={() => removeVariation(idx, vIdx)}
                        className="text-red-500 text-sm mt-2"
                      >
                        Variation 삭제
                      </button>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={() => addVariation(idx)} className="text-blue-500 text-sm">
                  + Variation 추가
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeTextArea(idx)}
              className="px-4 mb-6 transition-colors duration-300 border border-gray-300 rounded cursor-pointer hover:bg-red-500 hover:text-white"
            >
              삭제
            </button>
          </div>
        </div>
      ))}

      <div className="flex gap-[15px] save_button_div">
        <button onClick={addTextArea} className="plus-button rounded-[10px]">
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