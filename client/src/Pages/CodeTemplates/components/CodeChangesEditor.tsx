import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";

import Gap from "@/Components/Common/Gap";
import CopyTextButton from "@/Components/Common/CopyTextButton";
import ActionButton from "@/Components/Common/SetActionButton"

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

          <div index={idx} className="as_was_to_be_div flex items-start gap-[30px]">
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
              <ActionButton type="button" icon="DeleteOutlined" onClick={() => removeTextArea(idx)}>
                세트 삭제
              </ActionButton>

              <ActionButton color="#F7AC6E" icon="Add" type="button" onClick={() => addVariation(idx)}>
                AS-WAS 추가
              </ActionButton>
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
            <div className="w-[100%] flex flex-col">
              {/* ========================= */}
              {/* 1) AS-WAS / TO-BE         */}
              {/* ========================= */}
              <div className="w-[95%] flex gap-[20px] justify-center">
                <div className="as_was_div">
                  <div className="flex font-bold">
                    <span className="ml-1 text-[#4b5563;] mb-[5px]">
                      Default (UK)
                    </span>
                    </div>
                  <textarea
                    rows="5"
                    className="code-textarea"
                    placeholder="AS-WAS 코드를 입력해 주세요."
                    value={item.aswas_code}
                    onChange={(e) => handleAswasChange(idx, e.target.value)}
                  />
                  <div className="flex font-bold">
                    <div className="text-xs">
                      <span className="ml-1 text-[#4b5563;]">
                        [AS-WAS] 원본코드 내 AS-WAS 코드 출현 횟수:
                      </span>
                    </div>
                    {backupHtmlFile ? (
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
                  <CopyTextButton text="코드 복사" value={item.aswas_code} style={{ marginTop: "10px" }} />
                </div>

                <div className="to_be_div">
                  <br />
                  <div className="mb-[5px]" />
                  <textarea
                    rows="5"
                    className="code-textarea"
                    placeholder="TO-BE 코드를 입력해 주세요."
                    value={item.tobe_code}
                    onChange={(e) => handleTobeChange(idx, e.target.value)}
                  />
                  <div className="text-xs">
                    <span className="ml-1 font-bold text-[#4b5563;]">[TO-BE]</span>
                  </div>
                  <CopyTextButton text="코드 복사" value={item.tobe_code} style={{ marginTop: "15px" }} />
                </div>
              </div>
              {/* ========================= */}
              {/* 2) Variations */}
              {/* ========================= */}
              {item.variations?.map((variation, vIdx) => (
                <div className="w-[95%] flex gap-[20px] justify-center">
                  <div key={vIdx} className="as_was_div">
                    <hr className="border-t border-gray-300 mt-[10px] mb-[10px]" />
                    {/* AS-WAS Variation */}
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                      <span/>
                      <ActionButton icon="ClearOutlined" type="button" onClick={() => removeVariation(idx, vIdx)}>
                        삭제
                      </ActionButton>
                    </div>
                      <textarea
                        rows="5"
                        className="code-textarea mt-2"
                        placeholder="AS-WAS Variation 코드"
                        value={variation.aswas_code_variation ?? ""}
                        onChange={(e) => handleVariationChange(idx, vIdx, "aswas_code_variation", e.target.value)}
                      />
                      <div className="flex font-bold">
                        <div className="text-xs">
                          <span className="ml-1 text-[#4b5563;]">
                            [AS-WAS] 원본코드 내 AS-WAS 코드 출현 횟수:
                          </span>
                        </div>
                        {backupHtmlFile ? (
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
                      <div className="flex flex gap-[20px] justify-start">
                        <CopyTextButton text="코드 복사" value={variation.aswas_code_variation ?? ""} style={{ marginTop: "15px" }} />
                        <CountryMultiDropdown
                          value={variation.countries ?? []}
                          onChange={(updated) => handleVariationChange(idx, vIdx, "countries", updated)}
                        />
                      </div>
                  </div>
                  <div className="to_be_div" />
                </div>
              ))}
            </div>
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