import React, { useState } from "react";
import Rodal from "rodal";
import "@Create_Template/AssetTemplate.scss";
import "rodal/lib/rodal.css";
import AddIcon from "@mui/icons-material/Add";
import { countOccurrences as countOccurrencesUtil } from "@/utils/codeUtils";

const AssetTemplate = ({
  content,
  originalHtmlFile,
  assetPptNos,
  assetAsWasCodes,
  assetToBeCodes,
  setAssetPptNos,
  setAssetAsWasCodes,
  setAssetToBeCodes,
  addAssetArea,
  onSave,
  removeAssetArea,
}) => {
  const [visible, setVisible] = useState(false);

  const show = () => {
    setVisible(true);
    console.log("in AssetTemplate pptNos : ", assetPptNos);
    console.log("in AssetTemplate asWas : ", assetAsWasCodes);
    console.log("in AssetTemplate toBe : ", assetToBeCodes);
  }

  const hide = () => {
    setVisible(false);
  }

  const countOccurrences = (asWasCode) => {
    if (!originalHtmlFile || !asWasCode) {
      return "Run Test를 통해 알아보세요";
    }

    const occurrenceCount = countOccurrencesUtil(originalHtmlFile, asWasCode);
    return occurrenceCount !== "null" ? occurrenceCount : "0";
  };

  const handleSave = () => {
    console.log("Saving asset data...");
    onSave();
    hide();
  };

  return (
    <div className="asset-template">
      <button 
        className="flex py-3 px-20 justify-center items-center bg-[#000] text-white font-[600] text-[13px] rounded-[10px]" 
        onClick={() => show()}
      >
        {`Asset`}
      </button>
      <div style={{ fontSize: 12, color: "gray" }}>
        (250519 기준 사용중단. Non-Asset만 사용)
      </div>

      <Rodal 
        width={1000}
        height={700}
        visible={visible}
        onClose={() => hide()}
      >
        <div>
          {content}
          <div className="title_as_to_div">
            <div className="Out_div">
              <h4 className="title_as">As was</h4>
            </div>
            <div className="In_div">
              <h4 className="title_to">To be</h4>
            </div>
          </div>

          <div className="asset_list" style={{ maxHeight: "500px", overflowY: "auto" }}>
            {assetAsWasCodes.length > 0 ? (
              assetAsWasCodes.map((code, index) => (
                <div className="asset_as_was_to_be_div" key={index}>
                  <div className="num_type">
                    <div className="ppt_no_col">
                      <label className="ppt_no">PPT NO.</label>
                      <input
                        type="text"
                        className="ppt_no_text"
                        value={assetPptNos[index] || ""}
                        onChange={(e) => {
                          if (setAssetPptNos) {
                            setAssetPptNos(index, e.target.value);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="as_was_div">
                    <textarea
                      value={code}
                      className="code-textarea"
                      onChange={(e) => setAssetAsWasCodes(index, e.target.value)}
                      placeholder="//"
                    />
                    <div className="duplicate-count">포함된 횟수: {countOccurrences(code)}</div>
                  </div>

                  <div className="to_be_div">
                    <textarea
                      value={assetToBeCodes[index] || ""}
                      onChange={(e) => setAssetToBeCodes(index, e.target.value)}
                      placeholder="//"
                      className="code-textarea"
                    />
                  </div>
                  <button type="button" onClick={() => removeAssetArea(index)} className="asset_remove_button">
                    삭제
                  </button>
                </div>
              ))
            ) : (
              <div>템플릿이 없습니다. 추가해주세요.</div>
            )}
          </div>

          <div className="asset_button_div">
            <button type="button" onClick={addAssetArea} className="add_more_button">
              <AddIcon />
              <span className="add_button_text">항목 추가</span>
            </button>
            <button type="button" onClick={handleSave} className="asset_save_button">
              <span className="add_button_text">저장</span>
            </button>
          </div>
        </div>
      </Rodal>
    </div>
  );
}

export default AssetTemplate;
