import React from 'react';
import Rodal from 'rodal';
import './Asset_template.scss';
import 'rodal/lib/rodal.css';
import AddIcon from '@mui/icons-material/Add'; // Import AddIcon
import { countOccurrences as countOccurrencesUtil } from '../utils/codeUtils';

class Asset_Template extends React.Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  show() {
    this.setState({ visible: true });
    console.log("in asset_template as was : ", this.props.asset_asWas);
    console.log("in asset_template to be : ", this.props.asset_toBe);
    console.log("in asset_template to be : ", this.props.asset_pptNo);
  }

  hide() {
    this.setState({ visible: false });
  }

  countOccurrences = (asWasCode) => {
    if (!this.props.fileContent || !asWasCode) {
      return "Run Test를 통해 알아보세요"; // Provide a message when fileContent or asWasCode is not available
    }
  
    // Call the utility function to get the occurrence count
    const occurrenceCount = countOccurrencesUtil(this.props.fileContent, asWasCode);
    return occurrenceCount !== "null" ? occurrenceCount : "0"; // Return occurrences count
  };

  handleSave = () => {
    // Call any additional save logic here if necessary.
    console.log("Saving asset data...");
    this.props.onSave(); // Call the parent component's save function if needed
    this.hide();
  };

  render() {
    return (
      <div className='asset-template'>
        <button className='asset_upload_button' onClick={this.show.bind(this)}>Asset</button>

        <Rodal width={1000} height={700} visible={this.state.visible} onClose={this.hide.bind(this)}>
          <div>
            {this.props.content}
            <div className="title_as_to_div">
              <div className="Out_div"><h4 className="title_as">Out</h4></div>
              <div className="In_div"><h4 className="title_to">In</h4></div>
            </div>

            <div className="asset_list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {this.props.asset_asWas.length > 0 ? (
                this.props.asset_asWas.map((code, index) => (
                  <div className="asset_as_was_to_be_div" key={index}>
                    <div className="num_type">
                      <div className="ppt_no_col">
                        <label className="ppt_no">PPT NO.</label>
                        <input
                          type="text"
                          className="ppt_no_text"
                          value={this.props.asset_pptNo[index]}
                          onChange={(e) => this.props.setAsset_pptNo(index, e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="as_was_div">
                      <textarea
                        value={code}
                        className="code-textarea"
                        onChange={(e) => this.props.setAsset_asWas(index, e.target.value)} // Update asset_asWas
                        placeholder="//"
                      />
                      <div className="duplicate-count">
                        이 코드가 포함된 횟수: {this.countOccurrences(code)} {/* Display occurrence count */}
                      </div>
                    </div>

                    <div className="to_be_div">
                      <textarea
                        value={this.props.asset_toBe[index] || ""}
                        onChange={(e) => this.props.setAsset_toBe(index, e.target.value)} // Update asset_toBe
                        placeholder="//"
                        className="code-textarea"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => this.props.removeAssetArea(index)}
                      className="remove_button"
                    >
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