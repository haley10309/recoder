import React from "react";
import Rodal from "rodal";
import "rodal/lib/rodal.css";
import "@Localization/ShowDetail.scss";

class ShowDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = { visible: false };
    }

    show = () => {
        this.setState({ visible: true });
    };

    hide = () => {
        this.setState({ visible: false });
    };

    render() {
        const { untranslatedCopies = [], untranslatedLocalCopies = [] } = this.props;

        return (
            <div>
                <button className="show-detail-btn" onClick={this.show}>
                    View Details
                </button>

                <Rodal width={1000} height={700} visible={this.state.visible} onClose={this.hide}>
                    <div className="show-detail-container">
                        <div className="show-detail-header">Localization Detail</div>

                        <div className="copy-container">
                            {/* English Copies */}
                            <div className="copy-column">
                                <div className="copy-title">English Copies</div>
                                {untranslatedCopies.length > 0 ? (
                                    untranslatedCopies.map((item, index) => (
                                        <div key={index} className="copy-item">
                                            {item.english_copy}
                                        </div>
                                    ))
                                ) : (
                                    <div className="copy-item">No untranslated copies</div>
                                )}
                            </div>

                            {/* Local Copies */}
                            <div className="copy-column">
                                <div className="copy-title">Local Copies</div>
                                {untranslatedLocalCopies.length > 0 ? (
                                    untranslatedLocalCopies.map((copy, index) => (
                                        <div key={index} className="copy-item">
                                            {copy}
                                        </div>
                                    ))
                                ) : (
                                    <div className="copy-item">No local copies</div>
                                )}
                            </div>
                        </div>
                    </div>
                </Rodal>
            </div>
        );
    }
}

export default ShowDetail;
