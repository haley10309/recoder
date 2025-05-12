import React from "react";
import Rodal from "rodal";
import "@Create_Template/Asset_template.scss";
import "rodal/lib/rodal.css";
import AddIcon from "@mui/icons-material/Add";
import { countOccurrences as countOccurrencesUtil } from "@/utils/codeUtils";

// TODO: 함수형 컴포넌트로 수정
class Asset_Template extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  show() {
    this.setState({ visible: true });
    console.log("in asset_template pptNos : ", this.props.assetPptNos);
    console.log("in asset_template asWas : ", this.props.assetAsWasCodes);
    console.log("in asset_template toBe : ", this.props.assetToBeCodes);
  }

  hide() {
    this.setState({ visible: false });
  }

  countOccurrences = (asWasCode) => {
    if (!this.props.originalHtmlFile || !asWasCode) {
      return "Run Test를 통해 알아보세요";
    }

    const occurrenceCount = countOccurrencesUtil(this.props.originalHtmlFile, asWasCode);
    return occurrenceCount !== "null" ? occurrenceCount : "0";
  };

  handleSave = () => {
    console.log("Saving asset data...");
    this.props.onSave();
    this.hide();
  };

  render() {
    return (
      <div className="asset-template">
        <button className="flex py-3 px-20 justify-center items-center bg-[#000] text-white font-[600] text-[13px] rounded-[10px]" onClick={this.show.bind(this)}>
          Asset
        </button>

        <Rodal width={1000} height={700} visible={this.state.visible} onClose={this.hide.bind(this)}>
          <div>
            {this.props.content}
            <div className="title_as_to_div">
              <div className="Out_div">
                <h4 className="title_as">As was</h4>
              </div>
              <div className="In_div">
                <h4 className="title_to">To be</h4>
              </div>
            </div>

            <div className="asset_list" style={{ maxHeight: "500px", overflowY: "auto" }}>
              {this.props.assetAsWasCodes.length > 0 ? (
                this.props.assetAsWasCodes.map((code, index) => (
                  <div className="asset_as_was_to_be_div" key={index}>
                    <div className="num_type">
                      <div className="ppt_no_col">
                        <label className="ppt_no">PPT NO.</label>
                        <input
                          type="text"
                          className="ppt_no_text"
                          value={this.props.assetPptNos[index] || ""}
                          onChange={(e) => {
                            if (this.props.setAssetPptNos) {
                              this.props.setAssetPptNos(index, e.target.value);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="as_was_div">
                      <textarea value={code} className="code-textarea" onChange={(e) => this.props.setAssetAsWasCodes(index, e.target.value)} placeholder="//" />
                      <div className="duplicate-count">포함된 횟수: {this.countOccurrences(code)}</div>
                    </div>

                    <div className="to_be_div">
                      <textarea value={this.props.assetToBeCodes[index] || ""} onChange={(e) => this.props.setAssetToBeCodes(index, e.target.value)} placeholder="//" className="code-textarea" />
                    </div>
                    <button type="button" onClick={() => this.props.removeAssetArea(index)} className="asset_remove_button">
                      삭제
                    </button>
                  </div>
                ))
              ) : (
                <div>템플릿이 없습니다. 추가해주세요.</div>
              )}
            </div>

            <div className="asset_button_div">
              <button type="button" onClick={this.props.addAssetArea} className="add_more_button">
                <AddIcon />
                <span className="add_button_text">항목 추가</span>
              </button>
              <button type="button" onClick={this.handleSave} className="asset_save_button">
                <span className="add_button_text">저장</span>
              </button>
            </div>
          </div>
        </Rodal>
      </div>
    );
  }
}

export default Asset_Template;
