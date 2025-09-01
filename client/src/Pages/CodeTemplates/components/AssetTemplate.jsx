import React, { useState } from "react";
import Rodal from "rodal";
import AddIcon from "@mui/icons-material/Add";

import { countOccurrences as countOccurrencesUtil } from "@/utils/codeUtils";

import "rodal/lib/rodal.css";
import "../CodeTemplates.scss";
import "./AssetTemplate.scss";

const AssetTemplate = ({
  content,
  originalHtmlFile,
  assetCodeChanges,
  handleAssetPptNoChange,
  handleAssetAsWasChange,
  handleAssetToBeChange,
  addAssetArea,
  onSave,
  removeAssetArea,
}) => {
  const [visible, setVisible] = useState(false);

  const show = () => {
    setVisible(true);
    // console.log("assetCodeChangess : ", assetCodeChanges);
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
            {assetCodeChanges.length > 0 ? (
              assetCodeChanges.map((item, index) => (
                <div className="asset_as_was_to_be_div" key={index}>
                  <div className="num_type">
                    <div className="ppt_no_col">
                      <label className="ppt_no">PPT NO.</label>
                      <input
                        type="text"
                        className="ppt_no_text"
                        value={item.ppt_no}
                        onChange={(e) => {
                          if (handleAssetPptNoChange) {
                            handleAssetPptNoChange(index, e.target.value);
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="as_was_div">
                    <textarea
                      value={item.aswas_code}
                      className="code-textarea"
                      onChange={(e) => handleAssetAsWasChange(index, e.target.value)}
                      placeholder="//"
                    />
                    <div className="duplicate-count">포함된 횟수: {countOccurrences(item.aswas_code)}</div>
                  </div>

                  <div className="to_be_div">
                    <textarea
                      value={item.tobe_code}
                      onChange={(e) => handleAssetToBeChange(index, e.target.value)}
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
